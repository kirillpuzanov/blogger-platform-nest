import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, type UserModelType } from '../domain/user.entity';
import { UsersRepository } from '../infra/users.repository';
import { CryptoService } from './crypto.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.modelName) private UserModel: UserModelType,
    private usersRepository: UsersRepository,
    private cryptoService: CryptoService,
    // @inject(SessionsRepository) public sessionsRepository: SessionsRepository,
  ) {}

  async deleteOne(id: string): Promise<void> {
    const deletedCount = await this.usersRepository.deleteOne(id);

    if (deletedCount < 1) {
      throw new NotFoundException('user is not exists', 'user');
    }
    // todo
    // await this.sessionsRepository.deleteAllUserSessions(id);

    return;
  }
}
