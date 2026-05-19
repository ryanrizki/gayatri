import { Module } from '@nestjs/common'
import { CheckoutController } from './checkout.controller'
import { CheckoutService } from './checkout.service'
import { PrismaService } from '../prisma.service'
import { WaModule } from '../wa/wa.module'

@Module({
  imports: [WaModule],
  controllers: [CheckoutController],
  providers: [CheckoutService, PrismaService]
})
export class CheckoutModule {}
