import { Injectable, PipeTransform } from '@nestjs/common';
import { isValidObjectId } from 'mongoose';
import {
  DomainException,
  DomainExceptionCode,
} from '../exceptions/domain.exception';
import { ObjectId } from 'mongodb';

/** Пайп используется только локально, так как ожидает обязательного параметра id */
@Injectable()
export class ObjectIdValidationPipe implements PipeTransform {
  transform(value: unknown): ObjectId {
    if (!isValidObjectId(value)) {
      throw new DomainException({
        code: DomainExceptionCode.ValidationError,
        message: 'Invalid id value',
        extensions: [{ field: 'id', message: 'Invalid id value' }],
      });
    }

    return value as ObjectId;
  }
}
