export class CreatePostDomainDto {
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
  blogName: string;
  createdAt: Date;
  extendedLikesInfo: {
    likesCount: number;
    dislikesCount: number;
    newestLikes: NewestLikes[];
  };
}

type NewestLikes = {
  addedAt: string;
  userId: string;
  login: string;
};
