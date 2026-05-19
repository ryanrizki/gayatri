import { Module } from '@nestjs/common'
import { InternalController } from './internal.controller'
import { InternalService, GATEWAY_FACTORY } from './internal.service'
import { InternalSecretGuard } from './internal-secret.guard'
import { PrismaService } from '../prisma.service'
import { createGateway } from '@gayatri/wa'

@Module({
  controllers: [InternalController],
  providers: [
    InternalService,
    InternalSecretGuard,
    PrismaService,
    { provide: GATEWAY_FACTORY, useValue: () => createGateway() }
  ]
})
export class InternalModule {}
