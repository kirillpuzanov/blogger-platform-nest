import { Module } from '@nestjs/common';
import { UsersController } from './users/users.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './users/domain/user.entity';
import { UsersRepository } from './users/infra/users.repository';
import { UsersQueryRepository } from './users/infra/users.query-repository';
import { CryptoService } from './users/application/crypto.service';
import { AuthController } from './users/auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { JwtInternalService } from './users/application/jwt.service';
import { NotificationsModule } from '../notifications/notifications.module';
import { CreateUserUseCase } from './users/usecases/admins/create-user.case';
import { DeleteUserUseCase } from './users/usecases/admins/delete-user.case';
import { LoginUseCase } from './users/usecases/login.case';
import { RegistrationUseCase } from './users/usecases/registration.case';
import { RegistrationConfirmUseCase } from './users/usecases/registrationConfirm.case';
import { SetNewPassUseCase } from './users/usecases/setNewPass.case';
import { RecoveryPassUseCase } from './users/usecases/recoveryPass.case';
import { ResendConfirmCodeUseCase } from './users/usecases/resendConfirmCode.case';

const useCases = [
  CreateUserUseCase,
  DeleteUserUseCase,
  LoginUseCase,
  RegistrationUseCase,
  RegistrationConfirmUseCase,
  SetNewPassUseCase,
  RecoveryPassUseCase,
  ResendConfirmCodeUseCase,
];

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: User.modelName,
        schema: UserSchema,
        collection: User.collectionName,
      },
    ]),
    JwtModule.register({}),

    NotificationsModule,
  ],
  controllers: [UsersController, AuthController],
  providers: [
    ...useCases,
    UsersRepository,
    UsersQueryRepository,

    CryptoService,
    JwtInternalService,
  ],
  // exports: [JwtInternalService], // todo нужно ли отдавать наружу JwtInternalService ??
})
export class UserAccountsModule {}
