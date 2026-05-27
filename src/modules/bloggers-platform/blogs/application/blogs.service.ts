import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Blog, type BlogModelType } from '../domain/blog.entity';
import { CreateBlogDto } from '../dto/create-blog.dto';
import { BlogsRepository } from '../infra/blogs.repository';

@Injectable()
export class BlogsService {
  constructor(
    @InjectModel(Blog.modelName) private BlogModel: BlogModelType,
    public blogsRepository: BlogsRepository,
    // @Inject(PostsService) public postsService: PostsService,
    // @Inject(CommentService) public commentService: CommentService,
  ) {}

  async createBlog(input: CreateBlogDto): Promise<string> {
    const newBlog = this.BlogModel.createBlog({
      websiteUrl: input.websiteUrl,
      description: input.description,
      name: input.name,
    });

    await this.blogsRepository.save(newBlog);
    return newBlog._id.toString();
  }

  async updateBlog(input: CreateBlogDto, id: string): Promise<void> {
    const blog = await this.blogsRepository.findByIdOrFail(id);
    const oldBlogName = blog.name;

    blog.updateBlog(input);
    await this.blogsRepository.save(blog);

    if (oldBlogName !== input.name) {
      // todo (проверить- если имя изменилось то ->)
      // /** обновим имя блога в привязанных к нему постах */
      // await this.postsService.updateManyPost({ blogId: id }, { blogName: name });
      // return;
    }
  }

  async deleteBlog(id: string): Promise<void> {
    await this.blogsRepository.deleteById(id);

    // todo
    // /** удаляем посты привязанные к этому блогу */
    // await this.postsService.deleteManyPost({ blogId: id });
    //
    // todo
    // /** удаляем комментарии привязанные постам блога */
    // await this.commentService.deleteManyComments({ blogId: id });
    return;
  }
}
