import { Controller, Post, UseGuards } from '@nestjs/common'
import { InternalSecretGuard } from './internal-secret.guard'
import { InternalService } from './internal.service'

@Controller('internal')
@UseGuards(InternalSecretGuard)
export class InternalController {
  constructor(private svc: InternalService) {}

  @Post('tick')
  async tick() {
    const reminders = await this.svc.scanReminders()
    const drain = await this.svc.drainWaJobs()
    return { ok: true, reminders, drain }
  }
}
