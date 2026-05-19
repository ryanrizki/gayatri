import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards
} from '@nestjs/common'
import type { Request } from 'express'
import { AdminAuthGuard } from './auth.guard'
import { AdminCheckoutService } from './checkouts.service'
import { ZodValidationPipe } from '../common/zod-validation.pipe'
import { CancelCheckout, ConfirmCheckout, RescheduleCheckout, CheckoutStatus } from '@gayatri/types'

type AuthedReq = Request & { admin: { sub: string; role: string } }

@Controller('admin/checkouts')
@UseGuards(AdminAuthGuard)
export class AdminCheckoutController {
  constructor(private svc: AdminCheckoutService) {}

  @Get()
  list(
    @Query('status') status?: string,
    @Query('q') q?: string,
    @Query('limit') limit?: string,
    @Query('skip') skip?: string
  ) {
    const parsedStatus = status && CheckoutStatus.safeParse(status).success
      ? (status as ReturnType<typeof CheckoutStatus.parse>)
      : undefined
    return this.svc.list({
      status: parsedStatus,
      q,
      limit: limit ? Number(limit) : undefined,
      skip: skip ? Number(skip) : undefined
    })
  }

  @Get(':id')
  detail(@Param('id') id: string) {
    return this.svc.detail(id)
  }

  @Post(':id/confirm')
  confirm(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(ConfirmCheckout)) body: { scheduledAt: string; branchId?: string; therapistId?: string },
    @Req() req: AuthedReq
  ) {
    return this.svc.confirm(id, body, req.admin.sub)
  }

  @Post(':id/reschedule')
  reschedule(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(RescheduleCheckout)) body: { scheduledAt: string },
    @Req() req: AuthedReq
  ) {
    return this.svc.reschedule(id, body, req.admin.sub)
  }

  @Post(':id/cancel')
  cancel(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(CancelCheckout)) body: { reason: string },
    @Req() req: AuthedReq
  ) {
    return this.svc.cancel(id, body, req.admin.sub)
  }

  @Post(':id/ongoing')
  ongoing(@Param('id') id: string, @Req() req: AuthedReq) {
    return this.svc.markOngoing(id, req.admin.sub)
  }

  @Post(':id/done')
  done(@Param('id') id: string, @Req() req: AuthedReq) {
    return this.svc.markDone(id, req.admin.sub)
  }
}
