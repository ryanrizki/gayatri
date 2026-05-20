import { Controller, Get, HttpCode, Post, UseGuards } from '@nestjs/common'
import { SkipThrottle } from '@nestjs/throttler'
import { AdminAuthGuard } from '../admin/auth.guard'
import { AdminRolesGuard } from '../admin/roles.guard'
import { Roles } from '../admin/roles.decorator'
import { WaSessionService } from './wa-session.service'

@Controller('admin/wa-session')
@UseGuards(AdminAuthGuard, AdminRolesGuard)
@Roles('OWNER', 'ADMIN')
export class WaSessionController {
  constructor(private readonly svc: WaSessionService) {}

  @Get('status')
  @SkipThrottle()
  status() {
    return this.svc.status()
  }

  @Post('connect')
  @HttpCode(202)
  async connect() {
    // Fire and forget: client polls /status for state transitions.
    this.svc.connect().catch(() => {
      /* errors land in service.lastError */
    })
    return { ok: true }
  }

  @Post('logout')
  @HttpCode(200)
  async logout() {
    await this.svc.logout()
    return { ok: true }
  }
}
