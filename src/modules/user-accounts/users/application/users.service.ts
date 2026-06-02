import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, type UserModelType } from '../domain/user.entity';
import { UsersRepository } from '../infra/users.repository';
import { CryptoService } from './crypto.service';
import { CreateUserDto } from '../dto/create-user.dto';
import {
  DomainException,
  DomainExceptionCode,
} from '../../../../core/exceptions/domain.exception';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.modelName) private UserModel: UserModelType,
    private usersRepository: UsersRepository,
    private cryptoService: CryptoService,
    // @inject(SessionsRepository) public sessionsRepository: SessionsRepository,
  ) {}

  async createUser(input: CreateUserDto): Promise<string> {
    const { login, email, password } = input;

    const emailAlreadyExist =
      await this.usersRepository.checkUniqueEmailOrLogin(email);

    if (emailAlreadyExist) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: 'Already exists',
        extensions: [{ field: 'email', message: 'Already exists' }],
      });
    }

    const loginAlreadyExist =
      await this.usersRepository.checkUniqueEmailOrLogin(login);
    if (loginAlreadyExist) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: 'Already exists',
        extensions: [{ field: 'login', message: 'Already exists' }],
      });
    }

    const passwordHash = await this.cryptoService.generateHash(password);

    /** при создании админом подтверждение не требуется */
    const user = this.UserModel.createUser(
      { login, email, passwordHash },
      true,
    );

    await this.usersRepository.save(user);
    return user._id.toString();
  }

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
