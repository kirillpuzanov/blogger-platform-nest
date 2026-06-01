import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { BlogsService } from './application/blogs.service';
import { BlogsQueryRepository } from './infra/blogs.query.repository';
import { GetBlogsQueryInputDto } from './api/input-dto/get-blogs-query.input-dto';
import { PaginatedViewDto } from '../../../core/dto/base-paginated.view-dto';
import { BlogViewDto } from './api/view-dto/blog.view-dto';
import {
  CreateBlogInputDto,
  CreatePostByBlogInputDto,
} from './api/input-dto/create-blog.input-dto';
import { PostsQueryRepository } from '../posts/infra/posts.query.repository';
import { PostsService } from '../posts/application/posts.service';
import { GetPostsQueryInputDto } from '../posts/api/input-dto/get-posts-query.input-dto';
import { ObjectIdValidationPipe } from '../../../core/pipes/object-id-validation.pipe';

@Controller('blogs')
export class BlogsController {
  constructor(
    private blogsQueryRepository: BlogsQueryRepository,
    private blogsService: BlogsService,
    private postsQueryRepository: PostsQueryRepository,
    private postsService: PostsService,
  ) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async getAll(
    @Query() query: GetBlogsQueryInputDto,
  ): Promise<PaginatedViewDto<BlogViewDto[]>> {
    return this.blogsQueryRepository.getAll(query);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async getById(
    @Param('id', ObjectIdValidationPipe) id: string,
  ): Promise<BlogViewDto> {
    return this.blogsQueryRepository.getByIdOrFail(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createBlog(@Body() body: CreateBlogInputDto): Promise<BlogViewDto> {
    const blogId = await this.blogsService.createBlog(body);
    return this.blogsQueryRepository.getByIdOrFail(blogId);
  }

  @Put(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateBlog(
    @Param('id', ObjectIdValidationPipe) id: string,
    @Body() body: CreateBlogInputDto,
  ) {
    return this.blogsService.updateBlog(body, id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteBlog(@Param('id', ObjectIdValidationPipe) id: string) {
    return this.blogsService.deleteBlog(id);
  }

  @Get(':blogId/posts')
  @HttpCode(HttpStatus.OK)
  async getPostsByBlog(
    @Param('blogId', ObjectIdValidationPipe) blogId: string,
    @Query() query: GetPostsQueryInputDto,
  ) {
    return this.postsQueryRepository.getPostsByBlog(
      blogId,
      query,
      // userId todo
    );
  }

  @Post('/:blogId/posts')
  @HttpCode(HttpStatus.CREATED)
  async createPostByBlog(
    @Param('blogId', ObjectIdValidationPipe) blogId: string,
    @Body() body: CreatePostByBlogInputDto,
  ) {
    const { content, shortDescription, title } = body;
    const createdPostId = await this.postsService.createPost({
      content,
      shortDescription,
      title,
      blogId,
    });

    return this.postsQueryRepository.getByIdOrFail(
      createdPostId,
      // userId, todo
    );
  }
}
