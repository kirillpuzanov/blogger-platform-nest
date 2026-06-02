export class RegistrationDto {
  login: string;
  password: string;
  email: string;
}

export class RegistrationConfirmDto {
  code: string;
}

export class RegistrationResendCodeDto {
  email: string;
}
