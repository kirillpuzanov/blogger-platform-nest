import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Post, PostDocument, type PostModelType } from '../domain/post.entity';
import { ObjectId } from 'mongodb';
import {
  DomainException,
  DomainExceptionCode,
} from '../../../../core/exceptions/domain.exception';

@Injectable()
export class PostsRepository {
  constructor(@InjectModel(Post.modelName) private PostModel: PostModelType) {}

  async save(post: PostDocument) {
    await post.save();
  }

  async findByIdOrFail(id: string): Promise<PostDocument> {
    const post = await this.PostModel.findOne({ _id: new ObjectId(id) });

    if (!post) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'post not found',
      });
    }
    return post;
  }

  async deleteById(id: string): Promise<void> {
    const res = await this.PostModel.deleteOne({ _id: new ObjectId(id) });

    if (res.deletedCount < 1) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'post not found',
      });
    }
  }

  async deleteMany(filter: Record<string, string>): Promise<void> {
    await this.PostModel.deleteMany(filter);
  }

  async updateMany(
    filter: Record<string, string>,
    data: Record<string, string>,
  ): Promise<void> {
    await this.PostModel.updateMany(filter, { $set: data });
  }
}
