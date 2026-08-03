import {
  ThrottlerGuard,
  type ThrottlerModuleOptions,
  ThrottlerStorage,
} from '@nestjs/throttler';
import { ExecutionContext, Injectable } from '@nestjs/common';
import { CoreConfig } from '../../config/core.config';
import { Reflector } from '@nestjs/core';

@Injectable()
export class IpRestrictionGuard extends ThrottlerGuard {
  constructor(
    options: ThrottlerModuleOptions,
    storageService: ThrottlerStorage,
    reflector: Reflector,
    private readonly coreConfig: CoreConfig,
  ) {
    super(options, storageService, reflector);
  }

  protected getTracker(req: Record<string, any>): Promise<string> {
    return req.ip;
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    if (!this.coreConfig.isEnableIpRestriction) {
      return true;
    }
    return super.canActivate(context);
  }
}
