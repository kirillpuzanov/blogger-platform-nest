import { Prop, Schema } from '@nestjs/mongoose';

@Schema({ _id: false })
export class RecoveryPassData {
  @Prop({ type: String, required: true })
  recoveryPassCode: string;

  @Prop({ type: Date, required: true })
  expirationCodeDate: Date;

  @Prop({ type: Date, required: true })
  sentCodeDate: Date;
}
