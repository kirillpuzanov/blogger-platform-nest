import { Injectable, PipeTransform } from '@nestjs/common';
import {
  DomainException,
  DomainExceptionCode,
} from '../exceptions/domain.exception';

const isValidUuid = (id: string) => {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
};

/** Пайп используется только локально, так как ожидает обязательного параметра id */
@Injectable()
export class ObjectIdValidationPipe implements PipeTransform {
  transform(value: unknown): string {
    if (typeof value !== 'string') {
      throw new DomainException({
        code: DomainExceptionCode.ValidationError,
        message: 'Invalid id value',
        extensions: [{ field: 'id', message: 'Invalid id value' }],
      });
    }

    if (!isValidUuid(value)) {
      throw new DomainException({
        code: DomainExceptionCode.ValidationError,
        message: 'Invalid id value',
        extensions: [{ field: 'id', message: 'Invalid id value' }],
      });
    }

    return value;
  }
}

// Mongoose

// /** Пайп используется только локально, так как ожидает обязательного параметра id */
// @Injectable()
// export class ObjectIdValidationPipe implements PipeTransform {
//   transform(value: unknown): ObjectId {
//     const receivedId =
//       value && typeof value === 'string' ? new ObjectId(value) : null;
//
//     if (!isValidObjectId(receivedId)) {
//       throw new DomainException({
//         code: DomainExceptionCode.ValidationError,
//         message: 'Invalid id value',
//         extensions: [{ field: 'id', message: 'Invalid id value' }],
//       });
//     }
//
//     return receivedId as ObjectId;
//   }
// }
