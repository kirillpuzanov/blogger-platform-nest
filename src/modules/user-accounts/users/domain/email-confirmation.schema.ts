import { Prop, Schema } from '@nestjs/mongoose';

@Schema({ _id: false })
export class EmailConfirmation {
  @Prop({ type: String, required: true })
  confirmationCode: string;

  @Prop({ type: Date, required: true })
  expirationDate: Date;

  @Prop({ type: Date, required: true })
  sentDate: Date;

  @Prop({ type: Boolean, required: true, default: false })
  isConfirmed: boolean;
}
