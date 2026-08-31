import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfirmationDataDomainDto } from '../domain/dto/confirmation-data.domain.dto';
import { UserTypeOrm } from '../domain/user.entity';
import { UpdateResult } from 'typeorm/query-builder/result/UpdateResult';

@Injectable()
export class UsersRepository {
  constructor(
    @InjectRepository(UserTypeOrm)
    private usersRepo: Repository<UserTypeOrm>,
  ) {}

  async save(user: UserTypeOrm): Promise<string> {
    const savedUser = await this.usersRepo.save<UserTypeOrm>(user);
    return savedUser.id;
  }

  async deleteOne(id: string): Promise<boolean> {
    const result = await this.usersRepo.delete(id);

    return !!result.affected;
  }

  async checkUniqueEmailOrLogin(loginOrEmail: string): Promise<boolean> {
    return this.usersRepo.exists({
      where: [{ login: loginOrEmail }, { email: loginOrEmail }],
    });
  }

  async getByLoginOrEmail(loginOrEmail: string): Promise<UserTypeOrm | null> {
    return this.usersRepo.findOne({
      where: [{ login: loginOrEmail }, { email: loginOrEmail }],
    });
  }

  async getByConfirmCode(confirmCode: string): Promise<UserTypeOrm | null> {
    return this.usersRepo.findOne({
      where: [{ confirmation_code: confirmCode }],
    });
  }

  async getByRecoveryPassCode(
    recoveryCode: string,
  ): Promise<UserTypeOrm | null> {
    return this.usersRepo.findOne({
      where: [{ recovery_code: recoveryCode }],
    });
  }

  async updateIsConfirm(userId: string): Promise<UpdateResult> {
    return this.usersRepo.update({ id: userId }, { is_confirmed: true });
  }

  async updatePasswordHash(
    userId: string,
    newPasswordHash: string,
  ): Promise<UpdateResult> {
    return this.usersRepo.update(
      { id: userId },
      { password_hash: newPasswordHash },
    );
  }

  async updateConfirmationData(
    id: string,
    confirmationData: ConfirmationDataDomainDto,
  ): Promise<UpdateResult> {
    return this.usersRepo.update(
      { id: id },
      {
        confirmation_code: confirmationData.confirmation_code,
        confirmation_sent_date: confirmationData.confirmation_sent_date,
        confirmation_expiration: confirmationData.confirmation_expiration,
      },
    );
  }
}

// @Injectable()
// export class UsersRepository {
//   constructor(@InjectDataSource() protected dataSource: DataSource) {}
//
//   async createUser(user: UserSqlDto): Promise<string> {
//     const result = await this.dataSource.query<[{ id: string }]>(
//       `INSERT INTO users (login, email, password_hash, is_confirmed, confirmation_code,
//          confirmation_expiration, confirmation_sent_date)
//          VALUES ($1, $2, $3, $4, $5, $6, $7)
//          RETURNING id`,
//       [
//         user.login,
//         user.email,
//         user.password_hash,
//         user.is_confirmed,
//         user.confirmation_code,
//         user.confirmation_expiration,
//         user.confirmation_sent_date,
//       ],
//     );
//     return result[0].id;
//   }
//
//   async deleteOne(id: string): Promise<number> {
//     const result = await this.dataSource.query<number[]>(
//       `
//         DELETE FROM users
//         WHERE id = $1`,
//       [id],
//     );
//
//     return result[1];
//   }
//
//   async checkUniqueEmailOrLogin(loginOrEmail: string): Promise<boolean> {
//     const result = await this.dataSource.query<[{ count: string }]>(
//       `
//         SELECT COUNT(*) as count FROM users
//         WHERE login = $1 or email = $1`,
//       [loginOrEmail],
//     );
//
//     return Number(result[0].count) > 0;
//   }
//
//   async getByLoginOrEmail(loginOrEmail: string): Promise<UserSqlDto | null> {
//     const result = await this.dataSource.query<UserSqlDto[]>(
//       `
//         SELECT *  FROM users
//         WHERE login = $1 or email = $1
//         LIMIT 1`,
//       [loginOrEmail],
//     );
//
//     if (result.length === 0) {
//       return null;
//     }
//
//     return result[0];
//   }
//
//   async updateConfirmationData(
//     id: string,
//     confirmationData: ConfirmationDataDomainDto,
//   ): Promise<void> {
//     return this.dataSource.query<void>(
//       `
//         UPDATE users
//         SET confirmation_code=$1, confirmation_sent_date=$2,confirmation_expiration=$3
//         WHERE id = $4
//         `,
//       [
//         confirmationData.confirmation_code,
//         confirmationData.confirmation_sent_date,
//         confirmationData.confirmation_expiration,
//         id,
//       ],
//     );
//   }
//
//   async updateIsConfirm(userId: string): Promise<void> {
//     return this.dataSource.query<void>(
//       `
//         UPDATE users
//         SET is_confirmed=true
//         WHERE id = $1
//         `,
//       [userId],
//     );
//   }
//
//   async updatePasswordHash(
//     userId: string,
//     newPasswordHash: string,
//   ): Promise<void> {
//     return this.dataSource.query<void>(
//       `
//         UPDATE users
//         SET password_hash=$1
//         WHERE id = $2
//         `,
//       [newPasswordHash, userId],
//     );
//   }
//
//   async getByConfirmCode(confirmCode: string): Promise<UserSqlDto | null> {
//     const result = await this.dataSource.query<UserSqlDto[]>(
//       `
//         SELECT *  FROM users
//         WHERE confirmation_code = $1
//         LIMIT 1`,
//       [confirmCode],
//     );
//
//     if (result.length === 0) {
//       return null;
//     }
//
//     return result[0];
//   }
//
//   async getByRecoveryPassCode(
//     recoveryCode: string,
//   ): Promise<UserSqlDto | null> {
//     const result = await this.dataSource.query<UserSqlDto[]>(
//       `
//         SELECT *  FROM users
//         WHERE recovery_code = $1
//         LIMIT 1`,
//       [recoveryCode],
//     );
//
//     if (result.length === 0) {
//       return null;
//     }
//     return result[0];
//   }
// }

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
