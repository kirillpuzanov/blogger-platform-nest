import { Injectable } from '@nestjs/common';
import { UserViewDto } from '../api/view-dto/user.view-dto';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { UserSqlDto } from '../domain/sql-entity-dto/user.sql-dto';

@Injectable()
export class UsersExternalRepository {
  constructor(@InjectDataSource() protected dataSource: DataSource) {}

  async getById(id: string): Promise<UserViewDto | null> {
    const users = await this.dataSource.query<UserSqlDto[]>(
      `
        SELECT * FROM users
        WHERE id=$1
        LIMIT 1`,
      [id],
    );

    if (users.length === 0) {
      return null;
    }
    return UserViewDto.mapToViewSql(users[0]);
  }
}

// Mongoose
// @Injectable()
// export class UsersExternalRepository {
//   constructor(@InjectModel(User.modelName) private UserModel: UserModelType) {}
//
//   async getById(id: string): Promise<UserViewDto | null> {
//     const user = await this.UserModel.findOne({ _id: new ObjectId(id) });
//
//     if (!user) {
//       return null;
//     }
//     return UserViewDto.mapToView(user);
//   }
// }
