import { Module } from '@nestjs/common'
import { InternalController } from './internal.controller'
import { InternalService, GATEWAY_FACTORY } from './internal.service'
import { InternalSecretGuard } from './internal-secret.guard'
import { InternalCron } from './internal.cron'
import { PrismaService } from '../prisma.service'
import { createGateway } from '@gayatri/wa'

@Module({
  controllers: [InternalController],
  providers: [
    InternalService,
    InternalSecretGuard,
    InternalCron,
    PrismaService,
    { provide: GATEWAY_FACTORY, useValue: () => createGateway() }
  ]
})
export class InternalModule {}
