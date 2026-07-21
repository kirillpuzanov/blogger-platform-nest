import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CreateUserInputDto } from './api/input-dto/create-user.input-dto';
import { UserViewDto } from './api/view-dto/user.view-dto';
import { GetUsersQueryInputDto } from './api/input-dto/get-users-query.input-dto';
import { ObjectIdValidationPipe } from '../../../core/pipes/object-id-validation.pipe';
import { BasicAuthGuard } from './guards/basic-auth.guard';
import { ApiBasicAuth, ApiBody } from '@nestjs/swagger';
import { CommandBus } from '@nestjs/cqrs';
import { CreateUserCommand } from './usecases/admins/create-user.case';
import { DeleteUserCommand } from './usecases/admins/delete-user.case';
import { UsersSqlQueryRepository } from './infra/users.sql.query-repository';
import { PaginatedViewDto } from '../../../core/dto/base-paginated.view-dto';

@Controller('users')
@UseGuards(BasicAuthGuard)
@ApiBasicAuth('basic_auth')
export class UsersController {
  constructor(
    private usersQueryRepository: UsersSqlQueryRepository,
    // private usersQueryRepository: UsersQueryRepository, // todo заменил на sqlRepo
    private readonly commandBus: CommandBus,
  ) {}

  @Get()
  async getAll(
    @Query() query: GetUsersQueryInputDto,
  ): Promise<PaginatedViewDto<UserViewDto[]>> {
    return this.usersQueryRepository.getAll(query);
  }

  @Post()
  @ApiBody({ type: CreateUserInputDto })
  async createUser(@Body() body: CreateUserInputDto): Promise<UserViewDto> {
    const createdUserId = await this.commandBus.execute<
      CreateUserCommand,
      string
    >(new CreateUserCommand(body));
    return this.usersQueryRepository.getByIdOrFail(createdUserId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteUser(
    @Param('id', ObjectIdValidationPipe) id: string,
  ): Promise<void> {
    return this.commandBus.execute(new DeleteUserCommand(id));
  }
}
