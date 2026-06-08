import { Blog, BlogDocument, type BlogModelType } from '../domain/blog.entity';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ObjectId } from 'mongodb';
import {
  DomainException,
  DomainExceptionCode,
} from '../../../../core/exceptions/domain.exception';

@Injectable()
export class BlogsRepository {
  constructor(@InjectModel(Blog.modelName) private BlogModel: BlogModelType) {}

  async save(blog: BlogDocument) {
    await blog.save();
  }

  async deleteById(id: string): Promise<void> {
    const res = await this.BlogModel.deleteOne({ _id: new ObjectId(id) });
    if (res.deletedCount < 1) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'blog not found',
      });
    }
  }

  async findByIdOrFail(id: string): Promise<BlogDocument> {
    const blog = await this.BlogModel.findOne({ _id: new ObjectId(id) });

    if (!blog) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'blog not found',
      });
    }
    return blog;
  }
}
