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
import { PaginatedViewDto } from '../../../core/dto/base-paginated.view-dto';
import { PostViewDto } from './api/view-dto/post.view-dto';
import { CreatePostInputDto } from './api/input-dto/create-post.input-dto';
import { GetPostsQueryInputDto } from './api/input-dto/get-posts-query.input-dto';
import { PostsQueryRepository } from './infra/posts.query.repository';
import { ObjectIdValidationPipe } from '../../../core/pipes/object-id-validation.pipe';
import { CommandBus } from '@nestjs/cqrs';
import { CreatePostCommand } from './useases/create-post.case';
import { UpdatePostCommand } from './useases/update-post.case';
import { DeletePostCommand } from './useases/delete-post.case';

@Controller('posts')
export class PostsController {
  constructor(
    private postsQueryRepository: PostsQueryRepository,
    private readonly commandBus: CommandBus,
    // private commentsQueryRepository: CommentsQueryRepository,
    // private commentService: CommentService,
  ) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async getAll(
    @Query() query: GetPostsQueryInputDto,
  ): Promise<PaginatedViewDto<PostViewDto[]>> {
    return this.postsQueryRepository.getAll(query);
  }

  @Get(':postId')
  @HttpCode(HttpStatus.OK)
  async getById(
    @Param('postId', ObjectIdValidationPipe) postId: string,
  ): Promise<PostViewDto> {
    return this.postsQueryRepository.getByIdOrFail(postId);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createPost(@Body() body: CreatePostInputDto): Promise<PostViewDto> {
    const postId = await this.commandBus.execute<CreatePostCommand, string>(
      new CreatePostCommand(body),
    );
    return this.postsQueryRepository.getByIdOrFail(postId);
  }

  @Put(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updatePost(
    @Param('id', ObjectIdValidationPipe) id: string,
    @Body() body: CreatePostInputDto,
  ) {
    return this.commandBus.execute<UpdatePostCommand, void>(
      new UpdatePostCommand(body, id),
    );
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deletePost(@Param('id', ObjectIdValidationPipe) id: string) {
    return this.commandBus.execute<DeletePostCommand, void>(
      new DeletePostCommand(id),
    );
  }

  // @Put(':id/like-status')
  // @HttpCode(HttpStatus.NO_CONTENT)
  // async updateLikeStatus(){}

  // @Post(':id/comments')
  // @HttpCode(HttpStatus.CREATED)
  // async createCommentByPost(
  //   @Param('id') id: string,
  //   @Body() body: CreateCommentInputDto,
  // ): Promise<CommentViewDto> {
  //   const postId = await this.commentService.createComment(
  //     userId,
  //     postId,
  //     body.content,
  //   );
  //   return this.commentssQueryRepository.getById(postId);
  // }

  // todo
  // @Get(':id/comments')
  // @HttpCode(HttpStatus.OK)
  // async getCommentsByPost(
  //   @Query() query: GetCommentsQueryInputDto,
  //   @Param('postId') postId: string,
  // ) {
  //   return this.commentsQueryRepository.getCommentsByPost(postId, query, userId);
  // }
}
