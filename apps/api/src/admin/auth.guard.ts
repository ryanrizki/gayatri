import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common'
import { AdminAuthService } from './auth.service'
import type { Request } from 'express'

@Injectable()
export class AdminAuthGuard implements CanActivate {
  constructor(private auth: AdminAuthService) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const req = ctx.switchToHttp().getRequest<Request & { admin?: unknown }>()
    const header = req.headers.authorization ?? ''
    const cookieToken = (req as Request & { cookies?: Record<string, string> }).cookies?.['gayatri_admin']
    const bearer = header.startsWith('Bearer ') ? header.slice(7) : ''
    const token = bearer || cookieToken
    if (!token) throw new UnauthorizedException('No token')
    try {
      const payload = await this.auth.verify(token)
      req.admin = payload
      return true
    } catch {
      throw new UnauthorizedException('Invalid token')
    }
  }
}
