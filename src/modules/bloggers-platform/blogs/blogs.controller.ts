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
import { CreateBlogInputDto } from './api/input-dto/CreateBlogInputDto';

@Controller('blogs')
export class BlogsController {
  constructor(
    private blogsQueryRepository: BlogsQueryRepository,
    private blogsService: BlogsService,
    // private postsQueryRepository: PostsQueryRepository,
    // private postsService: PostsService,
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
  async getById(@Param('id') id: string): Promise<BlogViewDto> {
    return this.blogsQueryRepository.getById(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createBlog(@Body() body: CreateBlogInputDto): Promise<BlogViewDto> {
    const blogId = await this.blogsService.createBlog(body);
    return this.blogsQueryRepository.getById(blogId);
  }

  @Put(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateBlog(@Param('id') id: string, @Body() body: CreateBlogInputDto) {
    return this.blogsService.updateBlog(body, id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteBlog(@Param('id') id: string) {
    return this.blogsService.deleteBlog(id);
  }

  // todo
  // @Get(':id/posts')
  // @HttpCode(HttpStatus.OK)
  // async getPostsByBlog(
  //   @Query() query: GetBlogsQueryInputDto,
  //   @Param('id') id: string,
  // ) {
  //   return this.postsQueryRepository.getPostsByBlog(id, query, userId);
  // }

  // @Post('/:blogId/posts')
  // @HttpCode(HttpStatus.CREATED)
  // async createPostByBlog(
  //   @Param('id') id: string,
  //   @Body() body: CreatePostByBlogInput,
  // ) {
  //   const createdPostId = await this.postsService.createPost({
  //     content,
  //     shortDescription,
  //     title,
  //     blogId,
  //   });
  //   const postView = await this.postsQueryRepository.getById(
  //     createdPostId,
  //     userId,
  //   );
  // }
}
