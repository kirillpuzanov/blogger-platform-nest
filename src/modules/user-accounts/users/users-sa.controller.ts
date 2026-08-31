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
import { PaginatedViewDto } from '../../../core/dto/base-paginated.view-dto';
import { UsersQueryRepository } from './infra/users.query-repository';

@Controller('sa/users')
@UseGuards(BasicAuthGuard)
@ApiBasicAuth('basic_auth')
export class UsersSaController {
  constructor(
    private usersQueryRepository: UsersQueryRepository,
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
