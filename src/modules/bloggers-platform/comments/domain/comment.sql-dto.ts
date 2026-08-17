export class CommentSqlDto {
  id: string;
  blog_id: string;
  post_id: string;
  content: string;
  user_id: string;
  user_login: string;
  created_at: Date;
  likes_count: number;
  dislikes_count: number;
}
