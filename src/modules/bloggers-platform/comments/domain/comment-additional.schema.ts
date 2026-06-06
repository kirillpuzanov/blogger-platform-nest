import { Prop, Schema } from '@nestjs/mongoose';

@Schema({ _id: false })
export class CommentatorInfo {
  @Prop({ type: String, require: true })
  userId: string;

  @Prop({ type: String, require: true })
  userLogin: string;
}

@Schema({ _id: false })
export class LikesInfo {
  @Prop({ type: Number, require: false, default: 0 })
  likesCount: number;

  @Prop({ type: Number, require: false, default: 0 })
  dislikesCount: number;
}
