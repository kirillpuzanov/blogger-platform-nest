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
  UseGuards,
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
import { GetPostsQueryInputDto } from '../posts/api/input-dto/get-posts-query.input-dto';
import { ObjectIdValidationPipe } from '../../../core/pipes/object-id-validation.pipe';
import { CommandBus } from '@nestjs/cqrs';
import { CreateBlogCommand } from './usecases/create-blog.case';
import { UpdateBlogCommand } from './usecases/update-blog.case';
import { DeleteBlogCommand } from './usecases/delete-blog.case';
import { CreatePostCommand } from '../posts/useases/create-post.case';
import { OptionalAccessAuthGuard } from '../../user-accounts/users/guards/optional-access-auth.guard';
import { ApiBasicAuth } from '@nestjs/swagger';
import { BasicAuthGuard } from '../../user-accounts/users/guards/basic-auth.guard';
import { ExtractUserFromRequest } from '../../../core/decorators/extract-user-from-request.decorator';

@Controller('blogs')
export class BlogsController {
  constructor(
    private blogsQueryRepository: BlogsQueryRepository,
    private postsQueryRepository: PostsQueryRepository,
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

  @ApiBasicAuth()
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(BasicAuthGuard)
  async createBlog(@Body() body: CreateBlogInputDto): Promise<BlogViewDto> {
    const blogId = await this.commandBus.execute<CreateBlogCommand, string>(
      new CreateBlogCommand(body),
    );
    return this.blogsQueryRepository.getByIdOrFail(blogId);
  }

  @ApiBasicAuth()
  @Put(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(BasicAuthGuard)
  async updateBlog(
    @Param('id', ObjectIdValidationPipe) id: string,
    @Body() body: CreateBlogInputDto,
  ) {
    return this.commandBus.execute<UpdateBlogCommand, void>(
      new UpdateBlogCommand(body, id),
    );
  }

  @ApiBasicAuth()
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(BasicAuthGuard)
  async deleteBlog(@Param('id', ObjectIdValidationPipe) id: string) {
    return this.commandBus.execute<DeleteBlogCommand, void>(
      new DeleteBlogCommand(id),
    );
  }

  @Get(':blogId/posts')
  @HttpCode(HttpStatus.OK)
  @UseGuards(OptionalAccessAuthGuard)
  async getPostsByBlog(
    @Param('blogId', ObjectIdValidationPipe) blogId: string,
    @Query() query: GetPostsQueryInputDto,
    @ExtractUserFromRequest() user: { id: string },
  ) {
    return this.postsQueryRepository.getPostsByBlog(blogId, query, user?.id);
  }

  @ApiBasicAuth()
  @Post('/:blogId/posts')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(BasicAuthGuard)
  async createPostByBlog(
    @Param('blogId', ObjectIdValidationPipe) blogId: string,
    @Body() body: CreatePostByBlogInputDto,
    @ExtractUserFromRequest() user: { id: string },
  ) {
    const { content, shortDescription, title } = body;
    const createdPostId = await this.commandBus.execute<
      CreatePostCommand,
      string
    >(
      new CreatePostCommand({
        content,
        shortDescription,
        title,
        blogId,
      }),
    );

    return this.postsQueryRepository.getByIdOrFail(createdPostId, user?.id);
  }
}
