export class CreateUserDomainDto {
  login: string;
  email: string;
  passwordHash: string;
}

export class CreateUserDto {
  login: string;
  email: string;
  password: string;
}
