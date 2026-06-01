export class Extension {
  constructor(
    public message: string,
    public field: string,
  ) {}
}

export class DomainException extends Error {
  code: DomainExceptionCode;
  extensions: Extension[];

  constructor(errorInfo: {
    code: DomainExceptionCode;
    message: string;
    extensions?: Extension[];
  }) {
    super(errorInfo.message);
    this.code = errorInfo.code;
    this.message = errorInfo.message;
    this.extensions = errorInfo.extensions ?? [];
  }
}

export enum DomainExceptionCode {
  //common
  NotFound = 1,
  BadRequest = 2,
  InternalServerError = 3,
  Forbidden = 4,
  ValidationError = 5,
  //auth
  Unauthorized = 11,
  EmailNotConfirmed = 12,
  ConfirmationCodeExpired = 13,
  PasswordRecoveryCodeExpired = 14,
}
