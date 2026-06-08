import { Prop, Schema } from '@nestjs/mongoose';
import { NewestLike } from './newest-like.schema';

@Schema({ _id: false })
export class ExtendedLikesInfo {
  @Prop({ type: Number, require: true })
  likesCount: number;

  @Prop({ type: Number, require: true })
  dislikesCount: number;

  @Prop({ type: [NewestLike], require: true })
  newestLikes: NewestLike[];
}
