import { ObjectId } from 'mongodb';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { UserDocument, UserModelType } from '../domain/user.entity';
import { User } from '../domain/user.entity';
import { UserViewDto } from '../api/view-dto/user.view-dto';

@Injectable()
export class UsersRepository {
  constructor(@InjectModel(User.modelName) private UserModel: UserModelType) {}

  // async create(user: UserDb): Promise<string> {
  //   const createdUser = await UserModel.insertOne(user);
  //   return createdUser._id.toString();
  // }

  // async update(_id: ObjectId, data: object): Promise<number> {
  //   const result = await UserModel.updateOne({ _id }, { $set: data });
  //   return result.modifiedCount;
  // }

  async save(user: UserDocument) {
    await user.save();
  }

  async deleteOne(id: string): Promise<number> {
    const res = await this.UserModel.deleteOne({ _id: new ObjectId(id) });
    return res.deletedCount;
  }

  async checkUniqueEmailOrLogin(loginOrEmail: string): Promise<boolean> {
    const user = await this.UserModel.findOne({
      $or: [{ login: loginOrEmail }, { email: loginOrEmail }],
    });

    return Boolean(user?.createdAt);
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

  async getById(id: string): Promise<UserViewDto | null> {
    const user = await this.UserModel.findOne({ _id: new ObjectId(id) });

    if (!user) {
      return null;
    }
    return UserViewDto.mapToView(user);
  }
}
