import { Injectable, NotFoundException } from '@nestjs/common';
import { ObjectId } from 'mongodb';
import { InjectModel } from '@nestjs/mongoose';
import { Post, type PostModelType } from '../domain/post.entity';
import { GetPostsQueryInputDto } from '../api/input-dto/get-posts-query.input-dto';
import { PaginatedViewDto } from '../../../../core/dto/base-paginated.view-dto';
import { PostViewDto } from '../api/view-dto/post.view-dto';
import { BlogsQueryRepository } from '../../blogs/infra/blogs.query.repository';
import { LikeQueryRepository } from '../../likes/infra/like.query.repository';

@Injectable()
export class PostsQueryRepository {
  constructor(
    @InjectModel(Post.modelName) private PostModel: PostModelType,
    private blogsQueryRepository: BlogsQueryRepository,
    private likeQueryRepository: LikeQueryRepository,
  ) {}

  async getAll(
    query: GetPostsQueryInputDto,
    userId: string | undefined,
  ): Promise<PaginatedViewDto<PostViewDto[]>> {
    const { pageNumber, pageSize, sortBy, sortDirection } = query;

    const posts = await this.PostModel.find()
      .sort({ [sortBy]: sortDirection })
      .skip(query.calculateSkip())
      .limit(pageSize)
      .lean();

    const totalCount = await this.PostModel.countDocuments();

    const postsIds = posts.map((el) => el._id.toString());
    const myLikes = await this.likeQueryRepository.getUserLikes(
      userId,
      postsIds,
    );

    const postsView = posts.map((el) => PostViewDto.mapToView(el, myLikes));

    return PaginatedViewDto.mapToView({
      page: pageNumber,
      totalCount,
      items: postsView,
      size: pageSize,
    });
  }

  async getByIdOrFail(
    id: string,
    userId: string | undefined,
  ): Promise<PostViewDto> {
    const post = await this.PostModel.findOne({ _id: new ObjectId(id) });

    if (!post) {
      throw new NotFoundException('post not found', 'id');
    }

    const userLikes = await this.likeQueryRepository.getUserLikes(userId, [
      post._id.toString(),
    ]);

    return PostViewDto.mapToView(post, userLikes);
  }

  async getPostsByBlog(
    blogId: string,
    query: GetPostsQueryInputDto,
    userId: string | undefined,
  ): Promise<PaginatedViewDto<PostViewDto[]>> {
    const { pageNumber, pageSize, sortBy, sortDirection } = query;

    const blog = await this.blogsQueryRepository.getByIdOrFail(blogId);

    if (!blog) {
      throw new NotFoundException('blog does not exists', 'blogId');
    }

    const postsByBlog = await this.PostModel.find({ blogId })
      .sort({ [sortBy]: sortDirection })
      .skip(query.calculateSkip())
      .limit(pageSize)
      .lean();
    const totalCount = await this.PostModel.countDocuments({ blogId });

    const postsByBlogIds = postsByBlog.map((el) => el._id.toString());
    const myLikes = await this.likeQueryRepository.getUserLikes(
      userId,
      postsByBlogIds,
    );

    const postsByBlogView = postsByBlog.map((el) =>
      PostViewDto.mapToView(el, myLikes),
    );

    return PaginatedViewDto.mapToView({
      page: pageNumber,
      totalCount,
      items: postsByBlogView,
      size: pageSize,
    });
  }
}
