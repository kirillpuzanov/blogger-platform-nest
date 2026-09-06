import { BlogTypeOrm } from '../../domain/blog.entity';

export class BlogViewDto {
  id: string;
  name: string;
  description: string;
  websiteUrl: string;
  createdAt: Date;
  isMembership: boolean;

  // Mongoose
  // static mapToView(blog: BlogDocument): BlogViewDto {
  //   const dto = new BlogViewDto();
  //
  //   dto.id = blog._id.toString();
  //   dto.name = blog.name;
  //   dto.description = blog.description;
  //   dto.websiteUrl = blog.websiteUrl;
  //   dto.createdAt = blog.createdAt;
  //   dto.isMembership = blog.isMembership;
  //
  //   return dto;
  // }

  static mapToViewSql(blog: BlogTypeOrm): BlogViewDto {
    const dto = new BlogViewDto();

    dto.id = blog.id;
    dto.name = blog.name;
    dto.description = blog.description;
    dto.websiteUrl = blog.website_url;
    dto.createdAt = blog.created_at;
    dto.isMembership = blog.is_membership;

    return dto;
  }
}
