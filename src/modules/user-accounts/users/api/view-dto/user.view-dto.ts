import { UserTypeOrm } from '../../domain/user.entity';

export class UserViewDto {
  id: string;
  login: string;
  email: string;
  createdAt: Date;

  // mongoose

  // static mapToView(user: UserDocument): UserViewDto {
  //   const dto = new UserViewDto();
  //
  //   dto.id = user._id.toString();
  //   dto.login = user.login;
  //   dto.email = user.email;
  //   dto.createdAt = user.createdAt;
  //
  //   return dto;
  // }

  static mapToViewSql(user: UserTypeOrm): UserViewDto {
    const dto = new UserViewDto();

    dto.id = user.id;
    dto.login = user.login;
    dto.email = user.email;
    dto.createdAt = user.created_at;
    return dto;
  }
}
