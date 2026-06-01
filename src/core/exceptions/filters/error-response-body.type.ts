import { DomainExceptionCode, Extension } from '../domain.exception';

export type ErrorResponseBody = {
  timestamp: string;
  path: string | null;
  errorsMessages: Extension[];
  message?: string;
  code?: DomainExceptionCode;
};
