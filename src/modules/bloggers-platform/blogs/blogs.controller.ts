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
import { CommandBus } from '@nestjs/cqrs';
import { CreateBlogCommand } from './usecases/create-blog.case';
import { UpdateBlogCommand } from './usecases/update-blog.case';
import { DeleteBlogCommand } from './usecases/delete-blog.case';

@Controller('blogs')
export class BlogsController {
  constructor(
    private blogsQueryRepository: BlogsQueryRepository,
    private postsQueryRepository: PostsQueryRepository,
    private postsService: PostsService,
    private readonly commandBus: CommandBus,
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
    const blogId = await this.commandBus.execute<CreateBlogCommand, string>(
      new CreateBlogCommand(body),
    );
    return this.blogsQueryRepository.getByIdOrFail(blogId);
  }

  @Put(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateBlog(
    @Param('id', ObjectIdValidationPipe) id: string,
    @Body() body: CreateBlogInputDto,
  ) {
    return this.commandBus.execute<UpdateBlogCommand, void>(
      new UpdateBlogCommand(body, id),
    );
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteBlog(@Param('id', ObjectIdValidationPipe) id: string) {
    return this.commandBus.execute<DeleteBlogCommand, void>(
      new DeleteBlogCommand(id),
    );
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
