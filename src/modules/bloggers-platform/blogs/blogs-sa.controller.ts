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
import { CreateBlogInputDto } from './api/input-dto/create-blog.input-dto';
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
import { CreatePostByBlogInputDto } from './api/input-dto/create-post-by-blog.input-dto';
import { UpdatePostByBlogInputDto } from './api/input-dto/update-post-by-blog.input-dto';
import { UpdatePostCommand } from '../posts/useases/update-post.case';
import { DeletePostCommand } from '../posts/useases/delete-post.case';

@Controller('sa/blogs')
@UseGuards(BasicAuthGuard)
@ApiBasicAuth('basic_auth')
export class BlogsSaController {
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

  // --  blog/posts

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

  @Post('/:blogId/posts')
  @HttpCode(HttpStatus.CREATED)
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

  @Put('/:blogId/posts/:postId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updatePostByBlog(
    @Param('blogId', ObjectIdValidationPipe) blogId: string,
    @Param('postId', ObjectIdValidationPipe) postId: string,
    @Body() body: UpdatePostByBlogInputDto,
  ) {
    const { content, shortDescription, title } = body;
    return this.commandBus.execute<UpdatePostCommand, string>(
      new UpdatePostCommand({
        content,
        shortDescription,
        title,
        blogId,
        postId,
      }),
    );
  }

  @Delete('/:blogId/posts/:postId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deletePost(
    @Param('blogId', ObjectIdValidationPipe) blogId: string,
    @Param('postId', ObjectIdValidationPipe) postId: string,
  ) {
    return this.commandBus.execute<DeletePostCommand, void>(
      new DeletePostCommand(postId, blogId),
    );
  }
}
