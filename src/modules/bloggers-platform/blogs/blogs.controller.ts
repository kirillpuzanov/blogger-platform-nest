import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { BlogsQueryRepository } from './infra/blogs.query.repository';
import { GetBlogsQueryInputDto } from './api/input-dto/get-blogs-query.input-dto';
import { PaginatedViewDto } from '../../../core/dto/base-paginated.view-dto';
import { BlogViewDto } from './api/view-dto/blog.view-dto';
import { PostsQueryRepository } from '../posts/infra/posts.query.repository';
import { GetPostsQueryInputDto } from '../posts/api/input-dto/get-posts-query.input-dto';
import { ObjectIdValidationPipe } from '../../../core/pipes/object-id-validation.pipe';
import { OptionalAccessAuthGuard } from '../../user-accounts/users/guards/optional-access-auth.guard';
import { ExtractUserFromRequest } from '../../../core/decorators/extract-user-from-request.decorator';

@Controller('blogs')
export class BlogsController {
  constructor(
    private blogsQueryRepository: BlogsQueryRepository,
    private postsQueryRepository: PostsQueryRepository,
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
}
