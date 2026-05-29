import { ObjectId } from 'mongodb';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { UserModelType } from '../domain/user.entity';
import { User } from '../domain/user.entity';
import { UserViewDto } from '../api/view-dto/user.view-dto';
import { GetUsersQueryInputDto } from '../api/input-dto/get-users-query.input-dto';
import { PaginatedViewDto } from '../../../core/dto/base-paginated.view-dto';

@Injectable()
export class UsersQueryRepository {
  constructor(@InjectModel(User.modelName) private UserModel: UserModelType) {}

  async getAll(
    query: GetUsersQueryInputDto,
  ): Promise<PaginatedViewDto<UserViewDto[]>> {
    const {
      pageNumber,
      pageSize,
      sortBy,
      sortDirection,
      searchLoginTerm,
      searchEmailTerm,
    } = query;

    let filter = {};
    const searchedFields: Array<object> = [];

    if (searchLoginTerm) {
      searchedFields.push({
        login: { $regex: searchLoginTerm, $options: 'i' },
      });
    }
    if (searchEmailTerm) {
      searchedFields.push({
        email: { $regex: searchEmailTerm, $options: 'i' },
      });
    }

    if (searchedFields.length) {
      filter = { $or: searchedFields };
    }
    const users = await this.UserModel.find(filter)
      .sort({ [sortBy]: sortDirection })
      .skip(query.calculateSkip())
      .limit(pageSize)
      .lean();

    const totalCount = await this.UserModel.countDocuments(filter);

    const usersView = users.map((user) => UserViewDto.mapToView(user));

    return PaginatedViewDto.mapToView({
      page: pageNumber,
      totalCount,
      items: usersView,
      size: pageSize,
    });
  }

  async getByIdOrFail(id: string): Promise<UserViewDto> {
    const user = await this.UserModel.findOne({ _id: new ObjectId(id) });

    if (!user) {
      throw new NotFoundException('user not found');
    }

    return UserViewDto.mapToView(user);
  }
}
