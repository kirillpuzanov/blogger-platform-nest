import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostsRepository } from '../infra/posts.repository';
import { LikeStatus } from '../../../../core/dto/like-status';
import { LikeService } from '../../likes/like.service';

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
  ) {}

  async execute(dto: UpdatePostLikeCommand): Promise<void> {
    const { userId, newLikeStatus, postId } = dto;

    /** получаем Пост либо exception */
    const post = await this.postsRepository.findByIdOrFail(postId);

    /** обновляем лайк / получаем дельту для изменения счетчика */
    const likesCountData = await this.likeService.updateLike(
      userId,
      postId,
      newLikeStatus,
    );

    /** если есть дельта  лайков - обновляем счетчик в посте */
    if (likesCountData && Object.keys(likesCountData).length > 0) {
      await this.postsRepository.updateLikeCount(
        likesCountData.likesCount ?? 0,
        likesCountData.dislikesCount ?? 0,
        post.id,
      );
    }
  }
}

//Mongoose
// @CommandHandler(UpdatePostLikeCommand)
// export class UpdatePostLikeUseCase implements ICommandHandler<UpdatePostLikeCommand> {
//   constructor(
//     private postsRepository: PostsRepository,
//     private likeService: LikeService,
//     private likeRepository: LikeRepository,
//   ) {}
//
//   async execute(dto: UpdatePostLikeCommand): Promise<void> {
//     // const { userId, newLikeStatus, postId } = dto;
//     return Promise.resolve();
//     // const post = await this.postsRepository.findByIdOrFail(postId);
//     //
//     // /** обновляем лайк / получаем дельту для изменения счетчика */
//     // const likesCountData = await this.likeService.updateLike(
//     //   userId,
//     //   postId,
//     //   newLikeStatus,
//     // );
//     //
//     // const lastPostLikes = await this.likeRepository.getLastLikes(postId);
//     // const newestLikes = lastPostLikes.map((el) => ({
//     //   addedAt: el.createdAt,
//     //   userId: el.author.userId,
//     //   login: el.author.userLogin,
//     // }));
//     //
//     // if (likesCountData && Object.keys(likesCountData).length > 0) {
//     //   post.updateLikeCount(
//     //     likesCountData.likesCount ?? 0,
//     //     likesCountData.dislikesCount ?? 0,
//     //   );
//     // }
//     //
//     // post.updateNewestLikes(newestLikes);
//     //
//     // await this.postsRepository.save(post);
//   }
// }
