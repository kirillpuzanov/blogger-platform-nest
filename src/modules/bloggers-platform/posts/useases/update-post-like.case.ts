import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostsRepository } from '../infra/posts.repository';
import { LikeStatus } from '../../../../core/dto/like-status';
import { LikeService } from '../../likes/like.service';
import { LikeRepository } from '../../likes/infra/like.repository';

export class UpdatePostLikeCommand {
  constructor(
    public postId: string,
    public userId: string,
    public newLikeStatus: LikeStatus,
  ) {}
}

@CommandHandler(UpdatePostLikeCommand)
export class UpdatePostLikeUseCase implements ICommandHandler<UpdatePostLikeCommand> {
  constructor(
    private postsRepository: PostsRepository,
    private likeService: LikeService,
    private likeRepository: LikeRepository,
  ) {}

  async execute(dto: UpdatePostLikeCommand): Promise<void> {
    // const { userId, newLikeStatus, postId } = dto;
    return Promise.resolve();
    // todo
    // const post = await this.postsRepository.findByIdOrFail(postId);
    //
    // /** обновляем лайк / получаем дельту для изменения счетчика */
    // const likesCountData = await this.likeService.updateLike(
    //   userId,
    //   postId,
    //   newLikeStatus,
    // );
    //
    // const lastPostLikes = await this.likeRepository.getLastLikes(postId);
    // const newestLikes = lastPostLikes.map((el) => ({
    //   addedAt: el.createdAt,
    //   userId: el.author.userId,
    //   login: el.author.userLogin,
    // }));
    //
    // if (likesCountData && Object.keys(likesCountData).length > 0) {
    //   post.updateLikeCount(
    //     likesCountData.likesCount ?? 0,
    //     likesCountData.dislikesCount ?? 0,
    //   );
    // }
    //
    // post.updateNewestLikes(newestLikes);
    //
    // await this.postsRepository.save(post);
  }
}
