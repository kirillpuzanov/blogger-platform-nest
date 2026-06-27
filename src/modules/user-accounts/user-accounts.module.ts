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
import { UsersExternalRepository } from './users/infra/users-external.repository';
import { DeleteUserSessionUseCase } from './users/usecases/sessions/delete-user-session.case';
import { DeleteUserSessionsUseCase } from './users/usecases/sessions/delete-user-sessions.case';
import { Session, SessionSchema } from './users/domain/session.entity';
import { SessionsController } from './users/sessions.controller';
import { SessionsQueryRepository } from './users/infra/sessions.query-repository';
import { SessionsRepository } from './users/infra/sessions.repository';

const useCases = [
  CreateUserUseCase,
  DeleteUserUseCase,
  LoginUseCase,
  RegistrationUseCase,
  RegistrationConfirmUseCase,
  SetNewPassUseCase,
  RecoveryPassUseCase,
  ResendConfirmCodeUseCase,

  DeleteUserSessionUseCase,
  DeleteUserSessionsUseCase,
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
    MongooseModule.forFeature([
      {
        name: Session.modelName,
        schema: SessionSchema,
        collection: Session.collectionName,
      },
    ]),
    JwtModule.register({}),
    NotificationsModule,
  ],
  controllers: [UsersController, AuthController, SessionsController],
  providers: [
    ...useCases,
    UsersRepository,
    UsersQueryRepository,
    UsersExternalRepository,

    SessionsRepository,
    SessionsQueryRepository,

    CryptoService,
    JwtInternalService,
  ],
  exports: [UsersExternalRepository, JwtInternalService], //todo Session repo
})
export class UserAccountsModule {}
