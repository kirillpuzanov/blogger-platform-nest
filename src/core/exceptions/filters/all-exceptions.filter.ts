import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ErrorResponseBody } from './error-response-body.type';
import { DomainExceptionCode } from '../domain.exception';
import { CoreConfig } from '../../../config/core.config';

/** обработчик 500-х ошибок */
@Catch()
export class AllHttpExceptionsFilter implements ExceptionFilter {
  constructor(private coreConfig: CoreConfig) {}

  catch(exception: Error, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const message = exception?.message ?? 'Unknown exception occurred.';
    const status = HttpStatus.INTERNAL_SERVER_ERROR;
    const responseBody = this.buildResponseBody(request.url, message);

    response.status(status).json(responseBody);
  }

  private buildResponseBody(
    requestUrl: string,
    message: string,
  ): ErrorResponseBody {
    if (!this.coreConfig.sendInternalServerErrorDetails) {
      return {
        timestamp: new Date().toISOString(),
        message: 'Some error occurred',
        errorsMessages: [],
      };
    }

    return {
      timestamp: new Date().toISOString(),
      path: requestUrl,
      message,
      errorsMessages: [],
      code: DomainExceptionCode.InternalServerError,
    };
  }
}
