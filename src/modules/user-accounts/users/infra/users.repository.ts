import { ObjectId } from 'mongodb';
import { Injectable } from '@nestjs/common';
import { User, UserDocument, type UserModelType } from '../domain/user.entity';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { InjectModel } from '@nestjs/mongoose';
import { UserSqlDto } from '../domain/sql-entity-dto/user.sql-dto';

@Injectable()
export class UsersRepository {
  constructor(
    @InjectDataSource() protected dataSource: DataSource,
    @InjectModel(User.modelName) private UserModel: UserModelType,
  ) {}

  // todo - удалить, для поддержки остальных флоу
  async save(user: UserDocument) {
    await user.save();
  }

  async createUser(user: UserSqlDto): Promise<string> {
    const result = await this.dataSource.query<[{ id: string }]>(
      `INSERT INTO users (login, email, password_hash, is_confirmed, confirmation_code,
         confirmation_expiration, confirmation_sent_date)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING id`,
      [
        user.login,
        user.email,
        user.password_hash,
        user.is_confirmed,
        user.confirmation_code,
        user.confirmation_expiration,
        user.confirmation_sent_date,
      ],
    );
    return result[0].id;
  }

  async deleteOne(id: string): Promise<number> {
    const res = await this.UserModel.deleteOne({ _id: new ObjectId(id) });
    return res.deletedCount;
  }

  async checkUniqueEmailOrLogin(loginOrEmail: string): Promise<boolean> {
    const result = await this.dataSource.query<[{ count: string }]>(
      `
        SELECT COUNT(*) as count FROM users
        WHERE login = $1 or email = $1`,
      [loginOrEmail],
    );

    return Number(result[0].count) > 0;
  }

  async getByLoginOrEmail(loginOrEmail: string): Promise<UserDocument | null> {
    return this.UserModel.findOne({
      $or: [{ login: loginOrEmail }, { email: loginOrEmail }],
    });
  }

  async getByConfirmCode(confirmCode: string): Promise<UserDocument | null> {
    return this.UserModel.findOne({
      'emailConfirmation.confirmationCode': confirmCode,
    });
  }

  async getByRecoveryPassCode(
    confirmCode: string,
  ): Promise<UserDocument | null> {
    return this.UserModel.findOne({
      'recoveryPassData.recoveryPassCode': confirmCode,
    });
  }
}

// Mongoose

// @Injectable()
// export class UsersRepository {
//   constructor(@InjectModel(User.modelName) private UserModel: UserModelType) {}
//
//   async save(user: UserDocument) {
//     await user.save();
//   }
//
//   async deleteOne(id: string): Promise<number> {
//     const res = await this.UserModel.deleteOne({ _id: new ObjectId(id) });
//     return res.deletedCount;
//   }
//
//   async checkUniqueEmailOrLogin(loginOrEmail: string): Promise<boolean> {
//     const user = await this.UserModel.findOne({
//       $or: [{ login: loginOrEmail }, { email: loginOrEmail }],
//     });
//
//     return Boolean(user?.createdAt);
//   }
//
//   async getByLoginOrEmail(loginOrEmail: string): Promise<UserDocument | null> {
//     return this.UserModel.findOne({
//       $or: [{ login: loginOrEmail }, { email: loginOrEmail }],
//     });
//   }
//
//   async getByConfirmCode(confirmCode: string): Promise<UserDocument | null> {
//     return this.UserModel.findOne({
//       'emailConfirmation.confirmationCode': confirmCode,
//     });
//   }
//
//   async getByRecoveryPassCode(
//     confirmCode: string,
//   ): Promise<UserDocument | null> {
//     return this.UserModel.findOne({
//       'recoveryPassData.recoveryPassCode': confirmCode,
//     });
//   }
// }
