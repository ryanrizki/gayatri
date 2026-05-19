import { Module } from '@nestjs/common'
import { InternalController } from './internal.controller'
import { InternalService } from './internal.service'
import { InternalSecretGuard } from './internal-secret.guard'
import { PrismaService } from '../prisma.service'

@Module({
  controllers: [InternalController],
  providers: [InternalService, InternalSecretGuard, PrismaService]
})
export class InternalModule {}
