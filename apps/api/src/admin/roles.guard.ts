import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import type { Request } from 'express'
import type { AdminRole } from '@gayatri/types'
import { ROLES_KEY } from './roles.decorator'

@Injectable()
export class AdminRolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(ctx: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<AdminRole[] | undefined>(ROLES_KEY, [
      ctx.getHandler(),
      ctx.getClass()
    ])
    if (!required || required.length === 0) return true
    const req = ctx.switchToHttp().getRequest<Request & { admin?: { role?: AdminRole } }>()
    const role = req.admin?.role
    if (!role || !required.includes(role)) {
      throw new ForbiddenException('Insufficient role')
    }
    return true
  }
}
