import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ObjectIdValidationPipe } from '../../../core/pipes/object-id-validation.pipe';
import { ExtractUserFromRequest } from '../../../core/decorators/extract-user-from-request.decorator';
import { AccessAuthGuard } from '../../user-accounts/users/guards/access-auth.guard';
import { UpdateCommentInputDto } from './api/input-dto/update-comment.input-dto';
import { UpdateCommentLikeInputDto } from './api/input-dto/update-comment-like.input-dto';
import { CommentsQueryRepository } from './infra/comments.query.repository';
import { CommandBus } from '@nestjs/cqrs';
import { UpdateCommentCommand } from './usecases/update-comment.case';
import { DeleteCommentCommand } from './usecases/delete-comment.case';
import { UpdateCommentLikeCommand } from './usecases/update-comment-like.case';
import { OptionalAccessAuthGuard } from '../../user-accounts/users/guards/optional-access-auth.guard';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('comments')
export class CommentsController {
  constructor(
    private commentsQueryRepository: CommentsQueryRepository,
    private readonly commandBus: CommandBus,
  ) {}

  @Get(':commentId')
  @HttpCode(HttpStatus.OK)
  @UseGuards(OptionalAccessAuthGuard)
  async getComment(
    @Param('commentId', ObjectIdValidationPipe) commentId: string,
    @ExtractUserFromRequest() user: { id: string },
  ) {
    return this.commentsQueryRepository.getById(commentId, user.id);
  }

  @Put(':commentId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(AccessAuthGuard)
  @ApiBearerAuth('access_token')
  async updateComment(
    @Param('commentId', ObjectIdValidationPipe) commentId: string,
    @ExtractUserFromRequest() user: { id: string },
    @Body() body: UpdateCommentInputDto,
  ) {
    return this.commandBus.execute<UpdateCommentCommand, void>(
      new UpdateCommentCommand(commentId, user.id, body.content),
    );
  }

  @Delete(':commentId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(AccessAuthGuard)
  @ApiBearerAuth('access_token')
  async deleteComment(
    @Param('commentId', ObjectIdValidationPipe) commentId: string,
    @ExtractUserFromRequest() user: { id: string },
  ) {
    return this.commandBus.execute<DeleteCommentCommand, void>(
      new DeleteCommentCommand(commentId, user.id),
    );
  }

  @Put(':commentId/like-status')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(AccessAuthGuard)
  @ApiBearerAuth('access_token')
  async updateLikeStatus(
    @Param('commentId', ObjectIdValidationPipe) commentId: string,
    @ExtractUserFromRequest() user: { id: string },
    @Body() body: UpdateCommentLikeInputDto,
  ) {
    return this.commandBus.execute<UpdateCommentLikeCommand, void>(
      new UpdateCommentLikeCommand(commentId, user.id, body.likeStatus),
    );
  }
}
