import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { PaginatedViewDto } from '../../../core/dto/base-paginated.view-dto';
import { PostViewDto } from './api/view-dto/post.view-dto';
import { GetPostsQueryInputDto } from './api/input-dto/get-posts-query.input-dto';
import { PostsQueryRepository } from './infra/posts.query.repository';
import { ObjectIdValidationPipe } from '../../../core/pipes/object-id-validation.pipe';
import { CommandBus } from '@nestjs/cqrs';
import { ExtractUserFromRequest } from '../../../core/decorators/extract-user-from-request.decorator';
import { OptionalAccessAuthGuard } from '../../user-accounts/users/guards/optional-access-auth.guard';
import { CommentsQueryRepository } from '../comments/infra/comments.query.repository';
import { GetCommentsQueryInputDto } from '../comments/api/input-dto/get-comments-query.input-dto';
import { ApiBearerAuth } from '@nestjs/swagger';
import { CreateCommentByPostInputDto } from '../comments/api/input-dto/create-comment-by-post.input-dto';
import { CommentViewDto } from '../comments/api/view-dto/comment.view-dto';
import { CreateCommentCommand } from '../comments/usecases/create-comment.case';
import { AccessAuthGuard } from '../../user-accounts/users/guards/access-auth.guard';
import { UpdatePostLikeInputDto } from './api/input-dto/update-post-like.input-dto';
import { UpdatePostLikeCommand } from './useases/update-post-like.case';

@Controller('posts')
export class PostsController {
  constructor(
    private postsQueryRepository: PostsQueryRepository,
    private commentsQueryRepository: CommentsQueryRepository,
    private readonly commandBus: CommandBus,
  ) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @UseGuards(OptionalAccessAuthGuard)
  async getAll(
    @Query() query: GetPostsQueryInputDto,
    @ExtractUserFromRequest() user: { id: string },
  ): Promise<PaginatedViewDto<PostViewDto[]>> {
    return this.postsQueryRepository.getAll(query, user.id);
  }

  @Get(':postId')
  @HttpCode(HttpStatus.OK)
  @UseGuards(OptionalAccessAuthGuard)
  async getById(
    @Param('postId', ObjectIdValidationPipe) postId: string,
    @ExtractUserFromRequest() user: { id: string },
  ): Promise<PostViewDto> {
    return this.postsQueryRepository.getByIdOrFail(postId, user?.id);
  }

  @Get(':postId/comments')
  @HttpCode(HttpStatus.OK)
  @UseGuards(OptionalAccessAuthGuard)
  async getCommentsByPost(
    @Query() query: GetCommentsQueryInputDto,
    @Param('postId') postId: string,
    @ExtractUserFromRequest() user: { id: string },
  ): Promise<PaginatedViewDto<CommentViewDto[]>> {
    return this.commentsQueryRepository.getCommentsByPost(
      postId,
      query,
      user?.id,
    );
  }

  @Post(':postId/comments')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(AccessAuthGuard)
  @ApiBearerAuth('access_token')
  async createCommentByPost(
    @Param('postId') postId: string,
    @Body() body: CreateCommentByPostInputDto,
    @ExtractUserFromRequest() user: { id: string },
  ): Promise<CommentViewDto> {
    const commentId = await this.commandBus.execute<
      CreateCommentCommand,
      string
    >(
      new CreateCommentCommand({
        userId: user.id,
        postId,
        content: body.content,
      }),
    );
    return this.commentsQueryRepository.getById(commentId, user.id);
  }

  @Put(':postId/like-status')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(AccessAuthGuard)
  @ApiBearerAuth('access_token')
  async updateLikeStatus(
    @Param('postId') postId: string,
    @Body() body: UpdatePostLikeInputDto,
    @ExtractUserFromRequest() user: { id: string },
  ) {
    return this.commandBus.execute<UpdatePostLikeCommand, void>(
      new UpdatePostLikeCommand(postId, user.id, body.likeStatus),
    );
  }
}
