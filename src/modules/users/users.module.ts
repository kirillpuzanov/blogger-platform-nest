import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './application/users.service';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './domain/user.entity';
import { UsersRepository } from './infra/users.repository';
import { UsersQueryRepository } from './infra/users.query-repository';
import { CryptoService } from './application/cryptoService';

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
export class UsersModule {}
