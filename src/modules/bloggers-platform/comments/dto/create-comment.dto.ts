export class CreateCommentDto {
  userId: string;
  postId: string;
  content: string;
}

export class CreateCommentDomainDto {
  postId: string;
  content: string;
  blogId: string;
  userId: string;
  login: string;
}

export class CreateCommentSqlDomainDto {
  postId: string;
  content: string;
  blogId: string;
  userId: string;
  login: string;
}
