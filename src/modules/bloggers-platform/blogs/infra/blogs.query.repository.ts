import { ObjectId } from 'mongodb';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Blog, type BlogModelType } from '../domain/blog.entity';
import { GetBlogsQueryInputDto } from '../api/input-dto/get-blogs-query.input-dto';
import { PaginatedViewDto } from '../../../../core/dto/base-paginated.view-dto';
import { BlogViewDto } from '../api/view-dto/blog.view-dto';
import {
  DomainException,
  DomainExceptionCode,
} from '../../../../core/exceptions/domain.exception';

@Injectable()
export class BlogsQueryRepository {
  constructor(@InjectModel(Blog.modelName) private BlogModel: BlogModelType) {}

  async getAll(
    query: GetBlogsQueryInputDto,
  ): Promise<PaginatedViewDto<BlogViewDto[]>> {
    const { pageNumber, pageSize, sortBy, sortDirection, searchNameTerm } =
      query;

    const filter: Record<string, object> = {};

    if (searchNameTerm) {
      filter.name = { $regex: searchNameTerm, $options: 'i' };
    }

    const blogs = await this.BlogModel.find(filter)
      .sort({ [sortBy]: sortDirection })
      .skip(query.calculateSkip())
      .limit(pageSize)
      .lean();

    const totalCount = await this.BlogModel.countDocuments(filter);

    const blogsView = blogs.map((el) => BlogViewDto.mapToView(el));

    return PaginatedViewDto.mapToView({
      page: pageNumber,
      totalCount,
      items: blogsView,
      size: pageSize,
    });
  }

  async getByIdOrFail(id: string): Promise<BlogViewDto> {
    const blog = await this.BlogModel.findOne({ _id: new ObjectId(id) });

    if (!blog) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'blog for create post not found',
      });
    }

    return BlogViewDto.mapToView(blog);
  }
}
