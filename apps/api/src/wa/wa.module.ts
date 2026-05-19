import { Module } from '@nestjs/common'
import { WaService } from './wa.service'
import { WaQueue } from './wa.queue'
import { PrismaService } from '../prisma.service'

@Module({
  providers: [WaService, WaQueue, PrismaService],
  exports: [WaService, WaQueue]
})
export class WaModule {}
