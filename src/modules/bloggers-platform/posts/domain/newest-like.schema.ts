import { Prop, Schema } from '@nestjs/mongoose';

@Schema({ _id: false })
export class NewestLike {
  @Prop({ type: String, require: true })
  addedAt: string;

  @Prop({ type: String, require: true })
  userId: string;

  @Prop({ type: String, require: true })
  login: string;
}
