import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, type UserModelType } from '../domain/user.entity';
import { UsersRepository } from '../infra/users.repository';
import { CryptoService } from './cryptoService';
import { CreateUserDto } from '../dto/create-user.dto';

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
      // todo
      // throw new DomainError('user with this email already exists', 'email');
    }

    const loginAlreadyExist =
      await this.usersRepository.checkUniqueEmailOrLogin(login);
    if (loginAlreadyExist) {
      // todo
      // throw new DomainError('user with this login already exists', 'login');
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
      // todo
      // throw new NotFoundError('user is not exists', 'user');
    }
    // todo
    // await this.sessionsRepository.deleteAllUserSessions(id);

    return;
  }
}
