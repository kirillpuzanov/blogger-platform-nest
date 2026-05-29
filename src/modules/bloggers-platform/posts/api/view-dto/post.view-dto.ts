import { ExtendedLikesInfo, PostDocument } from '../../domain/post.entity';
import { LikeStatus } from '../../../../../core/dto/like-status';

export class PostViewDto {
  id: string;
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
  blogName: string;
  createdAt: Date;

  extendedLikesInfo: ExtendedLikesInfo & { myStatus: LikeStatus };

  static mapToView(
    post: PostDocument,
    userLikes: Record<string, LikeStatus>,
  ): PostViewDto {
    const dto = new PostViewDto();

    dto.id = post._id.toString();
    dto.title = post.title;
    dto.shortDescription = post.shortDescription;
    dto.content = post.content;
    dto.blogId = post.blogId;
    dto.blogName = post.blogName;
    dto.createdAt = post.createdAt;
    dto.extendedLikesInfo = {
      ...post.extendedLikesInfo,
      myStatus: userLikes[dto.id] ?? LikeStatus.None,
    };

    return dto;
  }
}
