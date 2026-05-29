import { CreateBlogDto, CreatePostByBlogDto } from '../../dto/create-blog.dto';

export class CreateBlogInputDto implements CreateBlogDto {
  name: string;
  description: string;
  websiteUrl: string;
}

export class CreatePostByBlogInputDto implements CreatePostByBlogDto {
  title: string;
  shortDescription: string;
  content: string;
}
