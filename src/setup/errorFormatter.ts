import { ValidationError } from '@nestjs/common/interfaces/external/validation-error.interface';
import { Extension } from '../core/exceptions/domain.exception';

export const errorFormatter = (
  errors: ValidationError[],
  errorMessages?: Extension[],
): Extension[] => {
  const errorRes: Extension[] = errorMessages || [];

  errors.forEach((error) => {
    if (!error.constraints && error.children?.length) {
      errorFormatter(error.children, errorRes);
    } else if (error.constraints) {
      const constraintsKeys = Object.keys(error.constraints);

      for (const errorPropertyKey of constraintsKeys) {
        errorRes.push({
          message: error.constraints[errorPropertyKey] ?? 'Invalid value',
          field: error.property,
        });
      }
    }
  });

  return errorRes;
};
