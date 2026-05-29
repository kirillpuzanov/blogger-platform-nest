import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Post, PostDocument, type PostModelType } from '../domain/post.entity';
import { ObjectId } from 'mongodb';

@Injectable()
export class PostsRepository {
  constructor(@InjectModel(Post.modelName) private PostModel: PostModelType) {}

  async save(post: PostDocument) {
    await post.save();
  }

  async findByIdOrFail(id: string): Promise<PostDocument> {
    const post = await this.PostModel.findOne({ _id: new ObjectId(id) });

    if (!post) {
      //TODO: replace with domain exception
      throw new NotFoundException('post not found');
    }
    return post;
  }

  async deleteById(id: string): Promise<void> {
    const res = await this.PostModel.deleteOne({ _id: new ObjectId(id) });

    if (res.deletedCount < 1) {
      //TODO: replace with domain exception
      throw new NotFoundException('post not found');
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
