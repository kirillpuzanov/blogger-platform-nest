import { DomainExceptionCode, Extension } from '../domain.exception';

export type ErrorResponseBody = {
  errorsMessages: Extension[];
  message?: string;
  path?: string | null;
  timestamp?: string;
  code?: DomainExceptionCode;
};
