import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Post, type PostModelType } from '../domain/post.entity';
import { BlogsQueryRepository } from '../../blogs/infra/blogs.query.repository';
import { CreatePostInputDto } from '../api/input-dto/create-post.input-dto';
import { PostsRepository } from '../infra/posts.repository';

@Injectable()
export class PostsService {
  constructor(
    @InjectModel(Post.modelName) private PostModel: PostModelType,
    private blogsQueryRepository: BlogsQueryRepository,
    private postsRepository: PostsRepository,
    // private commentService: CommentService,
    // private likeService: LikeService,
    // private likeRepository: LikeRepository,
  ) {}

  async createPost(input: CreatePostInputDto): Promise<string> {
    const { blogId } = input;
    const blog = await this.blogsQueryRepository.getById(blogId);

    if (!blog) {
      throw new NotFoundException('blog not found', 'blogId');
    }

    const { content, shortDescription, title } = input;

    const newPost = this.PostModel.createPost({
      blogId,
      content,
      shortDescription,
      title,
      blogName: blog.name,
      createdAt: new Date(),
      extendedLikesInfo: {
        likesCount: 0,
        dislikesCount: 0,
        newestLikes: [],
      },
    });

    await this.postsRepository.save(newPost);
    return newPost._id.toString();
  }

  async updatePost(updatedPost: CreatePostInputDto, id: string): Promise<void> {
    const { title, blogId, content, shortDescription } = updatedPost;

    const post = await this.postsRepository.findByIdOrFail(id);

    post.updatePost({ title, blogId, content, shortDescription });

    await this.postsRepository.save(post);
  }

  async deletePost(id: string): Promise<void> {
    await this.postsRepository.deleteById(id);

    // todo
    /** удаляем комментарии привязанные к этому посту */
    // await this.commentService.deleteManyComments({ postId: id });
  }

  async deleteManyPost(filter: Record<string, string>): Promise<void> {
    await this.postsRepository.deleteMany(filter);
    return;
  }

  async updateManyPost(
    filter: Record<string, string>,
    data: Record<string, string>,
  ): Promise<void> {
    await this.postsRepository.updateMany(filter, data);
    return;
  }

  // todo - updateLikeStatus
  // async updateLikeStatus(
  //   userId: string,
  //   postId: string,
  //   newLikeStatus: LikeStatus,
  // ): Promise<Result<null>> {
  //   const existingPost = await this.postsRepository.getById(postId);
  //
  //   if (!existingPost) {
  //     return createResultObject({ status: ResultStatus.NotFound });
  //   }
  //
  //   /** обновляем лайк / получаем дельту для изменения счетчика */
  //   const { status, data } = await this.likeService.updateLike(
  //     userId,
  //     postId,
  //     newLikeStatus,
  //   );
  //
  //   const lastPostLikes = await this.likeRepository.getLastLikes(postId);
  //   const newestLikes = lastPostLikes.map((el) => ({
  //     addedAt: el.createdAt,
  //     userId: el.author.userId,
  //     login: el.author.userLogin,
  //   }));
  //
  //   const updatePayload = {
  //     $set: { "extendedLikesInfo.newestLikes": newestLikes },
  //   } as Record<"$set" | "$inc", object>;
  //
  //   /** добавляем к обновлению счетчик лайков поста */
  //   if (
  //     data &&
  //     status === ResultStatus.NoContent &&
  //     Object.keys(data).length > 0
  //   ) {
  //     updatePayload.$inc = {
  //       "extendedLikesInfo.likesCount": data.likesCount ?? 0,
  //       "extendedLikesInfo.dislikesCount": data.dislikesCount ?? 0,
  //     };
  //   }
  //   await this.postsRepository.updateLikes(postId, updatePayload);
  //
  //   return createResultObject({ status: ResultStatus.NoContent });
  // }
}
