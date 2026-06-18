import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, type UserModelType } from '../domain/user.entity';
import { UserViewDto } from '../api/view-dto/user.view-dto';
import { ObjectId } from 'mongodb';

@Injectable()
export class UsersExternalRepository {
  constructor(@InjectModel(User.modelName) private UserModel: UserModelType) {}

  async getById(id: string): Promise<UserViewDto | null> {
    const user = await this.UserModel.findOne({ _id: new ObjectId(id) });

    if (!user) {
      return null;
    }
    return UserViewDto.mapToView(user);
  }
}
