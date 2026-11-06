import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import type { Request } from 'express';

@Injectable()
export class MemberGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const role = request.user?.['role'];
    if (role !== 'member' && role !== 'admin') {
      throw new ForbiddenException('Member access required');
    }
    return true;
  }
}
