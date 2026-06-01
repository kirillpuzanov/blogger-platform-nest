import { Module } from '@nestjs/common';
import { UsersController } from './users/api/users.controller';
import { UsersService } from './users/application/users.service';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './users/domain/user.entity';
import { UsersRepository } from './users/infra/users.repository';
import { UsersQueryRepository } from './users/infra/users.query-repository';
import { CryptoService } from './users/application/cryptoService';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: User.modelName,
        schema: UserSchema,
        collection: User.collectionName,
      },
    ]),
  ],
  controllers: [UsersController],
  providers: [
    UsersService,
    UsersRepository,
    UsersQueryRepository,
    CryptoService,
  ],
})
export class UserAccountsModule {}
