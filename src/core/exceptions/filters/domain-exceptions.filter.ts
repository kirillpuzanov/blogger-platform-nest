import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

import { type ErrorResponseBody } from './error-response-body.type';
import { DomainException, DomainExceptionCode } from '../domain.exception';

@Catch(DomainException)
export class DomainHttpExceptionsFilter implements ExceptionFilter {
  catch(exception: DomainException, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status = this.mapToHttpStatus(exception.code);
    const responseBody = this.buildResponseBody(exception, request.url);

    response.status(status).json(responseBody);
  }

  private mapToHttpStatus(code: DomainExceptionCode): number {
    switch (code) {
      case DomainExceptionCode.BadRequest:
      case DomainExceptionCode.ValidationError:
      case DomainExceptionCode.ConfirmationCodeExpired:
      case DomainExceptionCode.EmailNotConfirmed:
      case DomainExceptionCode.PasswordRecoveryCodeExpired:
        return HttpStatus.BAD_REQUEST;

      case DomainExceptionCode.Forbidden:
        return HttpStatus.FORBIDDEN;
      case DomainExceptionCode.NotFound:
        return HttpStatus.NOT_FOUND;
      case DomainExceptionCode.Unauthorized:
        return HttpStatus.UNAUTHORIZED;
      case DomainExceptionCode.InternalServerError:
        return HttpStatus.INTERNAL_SERVER_ERROR;
      default:
        return HttpStatus.I_AM_A_TEAPOT;
    }
  }

  private buildResponseBody(
    exception: DomainException,
    requestUrl: string,
  ): ErrorResponseBody {
    return {
      timestamp: new Date().toISOString(),
      path: requestUrl,
      errorsMessages: exception.extensions,
      message: exception.message,
      code: exception.code,
    };
  }
}
