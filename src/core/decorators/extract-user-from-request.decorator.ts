import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

export const ExtractUserFromRequest = createParamDecorator(
  (_, context: ExecutionContext) => {
    const request: Request = context.switchToHttp().getRequest();

    const user = request.user;

    if (!user) {
      throw new Error('there is no user in the request object!');
    }

    return user;
  },
);
