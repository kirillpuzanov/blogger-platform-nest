export class PostSqlDto {
  id: string;
  title: string;
  short_description: string;
  content: string;
  blog_id: string;
  blog_name: string;
  created_at: Date;
  likes_count: number;
  dislikes_count: number;
}
