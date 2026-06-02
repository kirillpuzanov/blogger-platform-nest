import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CreateUserInputDto } from './api/input-dto/create-user.input-dto';
import { UserViewDto } from './api/view-dto/user.view-dto';
import { UsersQueryRepository } from './infra/users.query-repository';
import { UsersService } from './application/users.service';
import { GetUsersQueryInputDto } from './api/input-dto/get-users-query.input-dto';
import { PaginatedViewDto } from '../../../core/dto/base-paginated.view-dto';
import { ObjectIdValidationPipe } from '../../../core/pipes/object-id-validation.pipe';
import { BasicAuthGuard } from './guards/basic-auth.guard';
import { ApiBasicAuth, ApiBody } from '@nestjs/swagger';

@Controller('users')
@UseGuards(BasicAuthGuard)
@ApiBasicAuth('basicAuth')
export class UsersController {
  constructor(
    private usersQueryRepository: UsersQueryRepository,
    private usersService: UsersService,
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
    const createdUserId = await this.usersService.createUser(body);
    return this.usersQueryRepository.getByIdOrFail(createdUserId);
  }

  @Delete(':id')
  async deleteUser(
    @Param('id', ObjectIdValidationPipe) id: string,
  ): Promise<void> {
    return this.usersService.deleteOne(id);
  }
}
