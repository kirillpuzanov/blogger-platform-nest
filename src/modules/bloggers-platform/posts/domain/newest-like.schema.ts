import { Prop, Schema } from '@nestjs/mongoose';

@Schema({ _id: false })
export class NewestLike {
  @Prop({ type: Date, require: true })
  addedAt: Date;

  @Prop({ type: String, require: true })
  userId: string;

  @Prop({ type: String, require: true })
  login: string;
}
