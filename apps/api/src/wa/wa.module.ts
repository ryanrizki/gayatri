import { Module } from '@nestjs/common'
import { WaService } from './wa.service'
import { PrismaService } from '../prisma.service'

@Module({
  providers: [WaService, PrismaService],
  exports: [WaService]
})
export class WaModule {}
