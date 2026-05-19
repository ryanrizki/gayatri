import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common'
import type { Request } from 'express'

@Injectable()
export class InternalSecretGuard implements CanActivate {
  canActivate(ctx: ExecutionContext): boolean {
    const req = ctx.switchToHttp().getRequest<Request>()
    const expected = process.env.INTERNAL_SECRET
    if (!expected) throw new UnauthorizedException('INTERNAL_SECRET not configured')
    const header = req.headers.authorization ?? ''
    const token = header.startsWith('Bearer ') ? header.slice(7) : ''
    if (!token || token !== expected) throw new UnauthorizedException('Invalid internal secret')
    return true
  }
}
