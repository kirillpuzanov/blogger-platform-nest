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
import { ExtractUserFromRequest } from '../../../core/decorators/extract-user-from-request.decorator';
import { OptionalAccessAuthGuard } from '../../user-accounts/users/guards/optional-access-auth.guard';
import { CommentsQueryRepository } from '../comments/infra/comments.query.repository';
import { GetCommentsQueryInputDto } from '../comments/api/input-dto/get-comments-query.input-dto';
import { BasicAuthGuard } from '../../user-accounts/users/guards/basic-auth.guard';
import { ApiBasicAuth, ApiBearerAuth } from '@nestjs/swagger';
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

  @ApiBasicAuth()
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(BasicAuthGuard)
  async createPost(@Body() body: CreatePostInputDto): Promise<PostViewDto> {
    const postId = await this.commandBus.execute<CreatePostCommand, string>(
      new CreatePostCommand(body),
    );
    return this.postsQueryRepository.getByIdOrFail(postId, undefined);
  }

  @ApiBasicAuth()
  @Put(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(BasicAuthGuard)
  async updatePost(
    @Param('id', ObjectIdValidationPipe) id: string,
    @Body() body: CreatePostInputDto,
  ) {
    return this.commandBus.execute<UpdatePostCommand, void>(
      new UpdatePostCommand(body, id),
    );
  }

  @ApiBasicAuth()
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(BasicAuthGuard)
  async deletePost(@Param('id', ObjectIdValidationPipe) id: string) {
    return this.commandBus.execute<DeletePostCommand, void>(
      new DeletePostCommand(id),
    );
  }

  @Get(':id/comments')
  @HttpCode(HttpStatus.OK)
  @UseGuards(OptionalAccessAuthGuard)
  async getCommentsByPost(
    @Query() query: GetCommentsQueryInputDto,
    @Param('postId') postId: string,
    @ExtractUserFromRequest() user: { id: string },
  ) {
    return this.commentsQueryRepository.getCommentsByPost(
      postId,
      query,
      user?.id,
    );
  }

  @ApiBearerAuth()
  @Post(':postId/comments')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(AccessAuthGuard)
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

  @ApiBearerAuth()
  @Put(':postId/like-status')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(AccessAuthGuard)
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
