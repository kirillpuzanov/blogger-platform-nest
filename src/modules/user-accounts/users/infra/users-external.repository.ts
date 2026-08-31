import { Injectable } from '@nestjs/common';
import { UserViewDto } from '../api/view-dto/user.view-dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserTypeOrm } from '../domain/user.entity';

@Injectable()
export class UsersExternalRepository {
  constructor(
    @InjectRepository(UserTypeOrm)
    private usersRepo: Repository<UserTypeOrm>,
  ) {}

  async getById(id: string): Promise<UserViewDto | null> {
    const user = await this.usersRepo.findOneBy({ id: id });

    if (!user?.id) {
      return null;
    }
    return UserViewDto.mapToViewSql(user);
  }
}

// row Sql

// @Injectable()
// export class UsersExternalRepository {
//   constructor(@InjectDataSource() protected dataSource: DataSource) {}
//
//   async getById(id: string): Promise<UserViewDto | null> {
//     const users = await this.dataSource.query<UserSqlDto[]>(
//       `
//         SELECT * FROM users
//         WHERE id=$1
//         LIMIT 1`,
//       [id],
//     );
//
//     if (users.length === 0) {
//       return null;
//     }
//     return UserViewDto.mapToViewSql(users[0]);
//   }
// }

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
