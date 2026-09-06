import { LikeStatus } from '../../../../../core/dto/like-status';
import { ExtendedLikesInfo } from '../../domain/extended-likes.schema';
import { PostSqlDto } from '../../domain/dto/post.sql-dto';
import { NewestLikes } from '../../domain/dto/create-post.domain-dto';

export class PostViewDto {
  id: string;
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
  blogName: string;
  createdAt: Date;

  extendedLikesInfo: ExtendedLikesInfo & { myStatus: LikeStatus };

  // Mongoose

  // static mapToView(
  //   post: PostDocument,
  //   userLikes: Record<string, LikeStatus>,
  // ): PostViewDto {
  //   const dto = new PostViewDto();
  //
  //   dto.id = post._id.toString();
  //   dto.title = post.title;
  //   dto.shortDescription = post.shortDescription;
  //   dto.content = post.content;
  //   dto.blogId = post.blogId;
  //   dto.blogName = post.blogName;
  //   dto.createdAt = post.createdAt;
  //
  //   const likesInfo = post.extendedLikesInfo;
  //   dto.extendedLikesInfo = {
  //     likesCount: likesInfo.likesCount,
  //     dislikesCount: likesInfo.dislikesCount,
  //     newestLikes: likesInfo.newestLikes,
  //     myStatus: userLikes[dto.id] ?? LikeStatus.None,
  //   };
  //
  //   return dto;
  // }

  static mapToViewSql(
    post: PostSqlDto,
    userLikes: Record<string, LikeStatus>,
    newestLikes: NewestLikes[],
  ): PostViewDto {
    const dto = new PostViewDto();

    dto.id = post.id;
    dto.title = post.title;
    dto.shortDescription = post.short_description;
    dto.content = post.content;
    dto.blogId = post.blog_id;
    dto.blogName = post.blog_name;
    dto.createdAt = post.created_at;

    dto.extendedLikesInfo = {
      likesCount: post.likes_count,
      dislikesCount: post.dislikes_count,
      newestLikes: newestLikes,
      myStatus: userLikes[dto.id] ?? LikeStatus.None,
    };

    return dto;
  }
}
