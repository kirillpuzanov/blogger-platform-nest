import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepository } from '../../infra/users.repository';
import { CreateUserDto } from '../../dto/create-user.dto';
import {
  DomainException,
  DomainExceptionCode,
} from '../../../../../core/exceptions/domain.exception';
import { CryptoService } from '../../application/crypto.service';
import { InjectModel } from '@nestjs/mongoose';
import { User, type UserModelType } from '../../domain/user.entity';

export class CreateUserCommand {
  constructor(public dto: CreateUserDto) {}
}

@CommandHandler(CreateUserCommand)
export class CreateUserUseCase implements ICommandHandler<CreateUserCommand> {
  constructor(
    @InjectModel(User.modelName)
    private UserModel: UserModelType,
    private usersRepository: UsersRepository,
    private cryptoService: CryptoService,
  ) {}

  async execute({ dto }: CreateUserCommand): Promise<string> {
    const { login, email, password } = dto;

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
}
