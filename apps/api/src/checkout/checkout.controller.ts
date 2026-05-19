import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common'
import { CheckoutService } from './checkout.service'
import { CheckoutSubmit } from '@gayatri/types'
import { ZodValidationPipe } from '../common/zod-validation.pipe'

@Controller('checkout')
export class CheckoutController {
  constructor(private svc: CheckoutService) {}

  @Post()
  submit(@Body(new ZodValidationPipe(CheckoutSubmit)) body: CheckoutSubmit) {
    return this.svc.submit(body)
  }

  @Get(':code/status')
  status(@Param('code') code: string, @Query('phone') phone: string) {
    return this.svc.statusByCode(code, phone)
  }
}
