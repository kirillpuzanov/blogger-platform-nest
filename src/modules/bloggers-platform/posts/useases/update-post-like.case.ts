import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostsRepository } from '../infra/posts.repository';

export class UpdatePostLikeCommand {
  constructor() {
    // public dto: CreatePostDto,
    // public id: string,
  }
}

@CommandHandler(UpdatePostLikeCommand)
export class UpdatePostLikeUseCase implements ICommandHandler<UpdatePostLikeCommand> {
  constructor(private postsRepository: PostsRepository) {}

  async execute(): Promise<void> {}

  // todo - updateLikeStatus
  // async updateLikeStatus(
  //   userId: string,
  //   postId: string,
  //   newLikeStatus: LikeStatus,
  // ): Promise<Result<null>> {
  //   const existingPost = await this.postsRepository.getById(postId);
  //
  //   if (!existingPost) {
  //     return createResultObject({ status: ResultStatus.NotFound });
  //   }
  //
  //   /** обновляем лайк / получаем дельту для изменения счетчика */
  //   const { status, data } = await this.likeService.updateLike(
  //     userId,
  //     postId,
  //     newLikeStatus,
  //   );
  //
  //   const lastPostLikes = await this.likeRepository.getLastLikes(postId);
  //   const newestLikes = lastPostLikes.map((el) => ({
  //     addedAt: el.createdAt,
  //     userId: el.author.userId,
  //     login: el.author.userLogin,
  //   }));
  //
  //   const updatePayload = {
  //     $set: { "extendedLikesInfo.newestLikes": newestLikes },
  //   } as Record<"$set" | "$inc", object>;
  //
  //   /** добавляем к обновлению счетчик лайков поста */
  //   if (
  //     data &&
  //     status === ResultStatus.NoContent &&
  //     Object.keys(data).length > 0
  //   ) {
  //     updatePayload.$inc = {
  //       "extendedLikesInfo.likesCount": data.likesCount ?? 0,
  //       "extendedLikesInfo.dislikesCount": data.dislikesCount ?? 0,
  //     };
  //   }
  //   await this.postsRepository.updateLikes(postId, updatePayload);
  //
  //   return createResultObject({ status: ResultStatus.NoContent });
  // }
}
