import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ValidationError } from '@nestjs/common/interfaces/external/validation-error.interface';
import {
  DomainException,
  DomainExceptionCode,
} from '../core/exceptions/domain.exception';
import { errorFormatter } from './errorFormatter';

export function pipesSetup(app: INestApplication) {
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,

      whitelist: true, // удаляет все опции, для которых нет валидационных декораторов

      stopAtFirstError: true, // первая ошибка для каждого поля

      exceptionFactory(errors: ValidationError[]) {
        const formattedErrors = errorFormatter(errors);
        throw new DomainException({
          code: DomainExceptionCode.ValidationError,
          message: 'Validation error',
          extensions: formattedErrors,
        });
      },
    }),
  );
}
