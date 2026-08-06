import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostsRepository } from '../infra/posts.repository';
import { LikeStatus } from '../../../../core/dto/like-status';
import { LikeService } from '../../likes/like.service';
import { LikeRepository } from '../../likes/infra/like.repository';
import { NewestLikeSqlDto } from '../domain/newest-like-sql.dto';

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
    const { userId, newLikeStatus, postId } = dto;

    /** получаем Пост либо exception */
    const post = await this.postsRepository.findByIdOrFail(postId);

    /** обновляем лайк / получаем дельту для изменения счетчика */
    const likesCountData = await this.likeService.updateLike(
      userId,
      postId,
      newLikeStatus,
    );

    /** получаем последние 3 лайка для поста */
    const lastPostLikes = await this.likeRepository.getLastLikes(postId);

    /** преобразуем в структуру NewestLikeSqlDto для сохранения в post-newest-like таблице */
    const newestLikes = lastPostLikes.map((el) =>
      NewestLikeSqlDto.createNewestLikeSqlDto(el, post.id),
    );

    /** если есть дельта  лайков - обновляем счетчик в посте */
    if (likesCountData && Object.keys(likesCountData).length > 0) {
      await this.postsRepository.updateLikeCount(
        likesCountData.likesCount ?? 0,
        likesCountData.dislikesCount ?? 0,
        post.id,
      );
    }

    /** если список последних лайков поста - обновляем их в отдельной таблице */
    if (lastPostLikes.length) {
      await this.postsRepository.updateNewestLikes(newestLikes, post.id);
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
