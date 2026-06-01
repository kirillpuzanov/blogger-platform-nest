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
} from '@nestjs/common';
import { CreateUserInputDto } from './input-dto/create-user.input-dto';
import { UserViewDto } from './view-dto/user.view-dto';
import { UsersQueryRepository } from '../infra/users.query-repository';
import { UsersService } from '../application/users.service';
import { GetUsersQueryInputDto } from './input-dto/get-users-query.input-dto';
import { PaginatedViewDto } from '../../../../core/dto/base-paginated.view-dto';
import { ObjectIdValidationPipe } from '../../../../core/pipes/object-id-validation.pipe';

@Controller('users')
export class UsersController {
  constructor(
    private usersQueryRepository: UsersQueryRepository,
    private usersService: UsersService,
  ) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async getUsers(
    @Query() query: GetUsersQueryInputDto,
  ): Promise<PaginatedViewDto<UserViewDto[]>> {
    return this.usersQueryRepository.getAll(query);
  }

  @Post()
  async createUser(@Body() body: CreateUserInputDto): Promise<UserViewDto> {
    const createdUserId = await this.usersService.createUser(body);
    return this.usersQueryRepository.getByIdOrFail(createdUserId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteUser(
    @Param('id', ObjectIdValidationPipe) id: string,
  ): Promise<void> {
    return this.usersService.deleteOne(id);
  }
}
