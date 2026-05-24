import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { randomUUID } from 'crypto';
import { HydratedDocument, Model } from 'mongoose';
import { CreateUserDomainDto } from '../dto/create-user.dto';

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

@Schema({ _id: false })
export class RecoveryPassData {
  @Prop({ type: String, required: true })
  recoveryPassCode: string;

  @Prop({ type: Date, required: true })
  expirationCodeDate: Date;

  @Prop({ type: Date, required: true })
  sentCodeDate: Date;
}

@Schema({ timestamps: true })
export class User {
  @Prop({ type: String, required: true })
  login: string;

  @Prop({ type: String, required: true })
  email: string;

  @Prop({ type: String, required: true })
  passwordHash: string;

  @Prop({ type: EmailConfirmation, required: true })
  emailConfirmation: EmailConfirmation;

  @Prop({ type: RecoveryPassData, required: false })
  recoveryPassData?: RecoveryPassData;

  @Prop({ type: String })
  createdAt: Date;

  static modelName = 'UserModel';
  static collectionName = 'users';

  static createUser(
    dto: CreateUserDomainDto,
    isConfirmed?: boolean,
  ): UserDocument {
    const user = new this();

    user.login = dto.login;
    user.email = dto.email;
    user.passwordHash = dto.passwordHash;

    user.createdAt = new Date();
    user.emailConfirmation = {
      confirmationCode: randomUUID(),
      sentDate: new Date(),
      isConfirmed: Boolean(isConfirmed),
      expirationDate: new Date(
        new Date().getTime() + 20 * 60 * 1000, // 20 min,
      ),
    };
    return user as UserDocument;
  }
}

export const UserSchema = SchemaFactory.createForClass(User);
//регистрирует методы сущности в схеме
UserSchema.loadClass(User);

//Типизация документа
export type UserDocument = HydratedDocument<User>;

//Типизация модели + статические методы
export type UserModelType = Model<UserDocument> & typeof User;
