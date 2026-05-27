import { Blog, BlogDocument, type BlogModelType } from '../domain/blog.entity';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ObjectId } from 'mongodb';

@Injectable()
export class BlogsRepository {
  constructor(@InjectModel(Blog.modelName) private BlogModel: BlogModelType) {}

  async save(blog: BlogDocument) {
    await blog.save();
  }

  async deleteById(id: string): Promise<void> {
    const res = await this.BlogModel.deleteOne({ _id: new ObjectId(id) });
    if (res.deletedCount < 1) {
      //TODO: replace with domain exception
      throw new NotFoundException('blog not found');
    }
  }

  async findByIdOrFail(id: string): Promise<BlogDocument> {
    const blog = await this.BlogModel.findOne({ _id: new ObjectId(id) });

    if (!blog) {
      //TODO: replace with domain exception
      throw new NotFoundException('blog not found');
    }
    return blog;
  }

  // async update(updatedBlog: CreateBlogInput, id: string): Promise<number> {
  //   const { name, description, websiteUrl } = updatedBlog;
  //   const res = await BlogModel.updateOne(
  //     { _id: new ObjectId(id) },
  //     { $set: { name, description, websiteUrl } },
  //   );
  //   return res.matchedCount;
  // }
}
