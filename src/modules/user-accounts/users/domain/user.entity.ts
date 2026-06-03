import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { randomUUID } from 'crypto';
import { HydratedDocument, Model } from 'mongoose';
import { CreateUserDomainDto } from '../dto/create-user.dto';
import { EmailConfirmation } from './email-confirmation.schema';
import { RecoveryPassData } from './recovery-pass.schema';

export const loginConstraints = {
  minLength: 3,
  maxLength: 10,
  match: /^[a-zA-Z0-9_-]*$/,
};

export const passwordConstraints = {
  minLength: 6,
  maxLength: 20,
};

export const emailConstraints = {
  match: /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/,
};

@Schema({ timestamps: true })
export class User {
  @Prop({ type: String, required: true, unique: true, ...loginConstraints })
  login: string;

  @Prop({ type: String, required: true, unique: true, ...emailConstraints })
  email: string;

  @Prop({ type: String, required: true })
  passwordHash: string;

  @Prop({ type: EmailConfirmation, required: true })
  emailConfirmation: EmailConfirmation;

  @Prop({ type: RecoveryPassData, required: false })
  recoveryPassData?: RecoveryPassData;

  @Prop({ type: Date })
  createdAt: Date;

  static modelName = 'UserModel';
  static collectionName = 'users';

  static createUser(
    dto: CreateUserDomainDto,
    isConfirmed?: boolean,
  ): UserDocument {
    const user = new this();

    const { confirmationCode, expirationDate, sentDate } =
      user.getNewConfirmationData();

    user.login = dto.login;
    user.email = dto.email;
    user.passwordHash = dto.passwordHash;

    user.createdAt = new Date();
    user.emailConfirmation = {
      isConfirmed: Boolean(isConfirmed),
      confirmationCode,
      expirationDate,
      sentDate,
    };
    return user as UserDocument;
  }

  getNewConfirmationData() {
    return {
      confirmationCode: randomUUID(),
      sentDate: new Date(),
      expirationDate: new Date(
        new Date().getTime() + 20 * 60 * 1000, // 20 min,
      ),
    };
  }

  updateIsConfirm() {
    this.emailConfirmation.isConfirmed = true;
  }

  updateConfirmationData() {
    const { confirmationCode, expirationDate, sentDate } =
      this.getNewConfirmationData();

    this.emailConfirmation.confirmationCode = confirmationCode;
    this.emailConfirmation.sentDate = sentDate;
    this.emailConfirmation.expirationDate = expirationDate;
  }

  updatePasswordHash(newPasswordHash: string) {
    this.passwordHash = newPasswordHash;
  }
}

export const UserSchema = SchemaFactory.createForClass(User);
//регистрирует методы сущности в схеме
UserSchema.loadClass(User);

//Типизация документа
export type UserDocument = HydratedDocument<User>;

//Типизация модели + статические методы
export type UserModelType = Model<UserDocument> & typeof User;
