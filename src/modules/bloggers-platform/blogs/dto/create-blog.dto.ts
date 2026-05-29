export class CreateBlogDto {
  name: string;
  description: string;
  websiteUrl: string;
}

export class CreatePostByBlogDto {
  title: string;
  shortDescription: string;
  content: string;
}
