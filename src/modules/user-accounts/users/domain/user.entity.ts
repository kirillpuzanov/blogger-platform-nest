import { randomUUID } from 'crypto';
import { CreateUserDomainDto } from '../dto/create-user.dto';
import { UserSqlDto } from './sql-entity-dto/user.sql-dto';
import { ConfirmationDataDomainDto } from './dto/confirmation-data.domain.dto';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

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

@Entity({ name: 'users' })
export class UserTypeOrm {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', nullable: false })
  login: string;
  @Column({ type: 'varchar', nullable: false })
  email: string;
  @Column({ type: 'varchar', nullable: false })
  password_hash: string;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @Column({ type: 'boolean', default: false })
  is_confirmed: boolean;

  @Column({ type: 'varchar', nullable: true })
  confirmation_code?: string | null = null;

  @Column({ type: 'timestamp', nullable: true })
  confirmation_expiration?: Date | null = null;

  @Column({ type: 'timestamp', nullable: true })
  confirmation_sent_date?: Date | null = null;

  @Column({ type: 'varchar', nullable: true })
  recovery_code?: string | null = null;

  @Column({ type: 'timestamp', nullable: true })
  recovery_expiration?: Date | null = null;

  @Column({ type: 'timestamp', nullable: true })
  recovery_sent_code?: Date | null = null;

  static createUser(
    dto: CreateUserDomainDto,
    isConfirmed?: boolean,
  ): UserSqlDto {
    const user = new this();

    const {
      confirmation_code,
      confirmation_sent_date,
      confirmation_expiration,
    } = this.getNewConfirmationData();

    user.login = dto.login;
    user.email = dto.email;
    user.password_hash = dto.passwordHash;

    user.is_confirmed = Boolean(isConfirmed);

    if (!isConfirmed) {
      user.confirmation_code = confirmation_code;
      user.confirmation_sent_date = confirmation_sent_date;
      user.confirmation_expiration = confirmation_expiration;
    }

    return user;
  }

  static getNewConfirmationData(): ConfirmationDataDomainDto {
    return {
      confirmation_code: randomUUID(),
      confirmation_sent_date: new Date(),
      confirmation_expiration: new Date(
        new Date().getTime() + 20 * 60 * 1000, // 20 min,
      ),
    };
  }
}

// export class UserSql implements UserSqlDto {
//   id: string;
//   login: string;
//   email: string;
//   password_hash: string;
//   created_at: Date;
//
//   is_confirmed: boolean;
//
//   confirmation_code?: string | null = null;
//   confirmation_expiration?: Date | null = null;
//   confirmation_sent_date?: Date | null = null;
//
//   recovery_code?: string | null = null;
//   recovery_expiration?: Date | null = null;
//   recovery_sent_code?: Date | null = null;
//
//   static createUser(
//     dto: CreateUserDomainDto,
//     isConfirmed?: boolean,
//   ): UserSqlDto {
//     const user = new this();
//
//     const {
//       confirmation_code,
//       confirmation_sent_date,
//       confirmation_expiration,
//     } = this.getNewConfirmationData();
//
//     user.login = dto.login;
//     user.email = dto.email;
//     user.password_hash = dto.passwordHash;
//
//     user.is_confirmed = Boolean(isConfirmed);
//
//     if (!isConfirmed) {
//       user.confirmation_code = confirmation_code;
//       user.confirmation_sent_date = confirmation_sent_date;
//       user.confirmation_expiration = confirmation_expiration;
//     }
//
//     return user;
//   }
//
//   static getNewConfirmationData(): ConfirmationDataDomainDto {
//     return {
//       confirmation_code: randomUUID(),
//       confirmation_sent_date: new Date(),
//       confirmation_expiration: new Date(
//         new Date().getTime() + 20 * 60 * 1000, // 20 min,
//       ),
//     };
//   }
// }

// Mongoose

// @Schema({ timestamps: true })
// export class User {
//   @Prop({ type: String, required: true, unique: true, ...loginConstraints })
//   login: string;
//
//   @Prop({ type: String, required: true, unique: true, ...emailConstraints })
//   email: string;
//
//   @Prop({ type: String, required: true })
//   passwordHash: string;
//
//   @Prop({ type: EmailConfirmation, required: true })
//   emailConfirmation: EmailConfirmation;
//
//   @Prop({ type: RecoveryPassData, required: false })
//   recoveryPassData?: RecoveryPassData;
//
//   @Prop({ type: Date })
//   createdAt: Date;
//
//   static modelName = 'UserModel';
//   static collectionName = 'users';
//
//   static createUser(
//     dto: CreateUserDomainDto,
//     isConfirmed?: boolean,
//   ): UserDocument {
//     const user = new this();
//
//     const { confirmationCode, expirationDate, sentDate } =
//       user.getNewConfirmationData();
//
//     user.login = dto.login;
//     user.email = dto.email;
//     user.passwordHash = dto.passwordHash;
//
//     user.createdAt = new Date();
//     user.emailConfirmation = {
//       isConfirmed: Boolean(isConfirmed),
//       confirmationCode,
//       expirationDate,
//       sentDate,
//     };
//     return user as UserDocument;
//   }
//
//   getNewConfirmationData() {
//     return {
//       confirmationCode: randomUUID(),
//       sentDate: new Date(),
//       expirationDate: new Date(
//         new Date().getTime() + 20 * 60 * 1000, // 20 min,
//       ),
//     };
//   }
// }
//
// export const UserSchema = SchemaFactory.createForClass(User);
// //регистрирует методы сущности в схеме
// UserSchema.loadClass(User);
//
// //Типизация документа
// export type UserDocument = HydratedDocument<User>;
//
// //Типизация модели + статические методы
// export type UserModelType = Model<UserDocument> & typeof User;
