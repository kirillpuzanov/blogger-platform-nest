import { Module } from '@nestjs/common';
import { UsersController } from './users/users.controller';
import { UsersService } from './users/application/users.service';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './users/domain/user.entity';
import { UsersRepository } from './users/infra/users.repository';
import { UsersQueryRepository } from './users/infra/users.query-repository';
import { CryptoService } from './users/application/crypto.service';
import { AuthController } from './users/auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { settings } from '../../setup/settings';
import { JwtInternalService } from './users/application/jwt.service';
import { AuthService } from './users/application/auth.service';
import { NotificationsModule } from '../notifications/notifications.module';
import { CreateUserUseCase } from './users/usecases/admins/create-user.case';

const useCases = [CreateUserUseCase];

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: User.modelName,
        schema: UserSchema,
        collection: User.collectionName,
      },
    ]),
    JwtModule.register({
      secret: settings.JWT_SECRET,
      signOptions: { expiresIn: '60m' },
    }),

    NotificationsModule,
  ],
  controllers: [UsersController, AuthController],
  providers: [
    ...useCases,
    UsersService,
    UsersRepository,
    UsersQueryRepository,

    AuthService,

    CryptoService,
    JwtInternalService,
  ],
  // exports: [JwtInternalService], // todo нужно ли отдавать наружу JwtInternalService ??
})
export class UserAccountsModule {}
