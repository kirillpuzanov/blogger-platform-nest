import { DomainExceptionCode, Extension } from '../domain.exception';

export type ErrorResponseBody = {
  message: string;
  errorsMessages: Extension[];
  path?: string | null;
  timestamp?: string;
  code?: DomainExceptionCode;
};
