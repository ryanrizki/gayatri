import { Module } from '@nestjs/common'
import { InternalController } from './internal.controller'
import { InternalService, GATEWAY_FACTORY } from './internal.service'
import { InternalSecretGuard } from './internal-secret.guard'
import { InternalCron } from './internal.cron'
import { PrismaService } from '../prisma.service'
import { createGateway } from '@gayatri/wa'
import { WaSessionModule } from '../wa-session/wa-session.module'
import { InternalWaGateway } from '../wa-session/internal-wa.gateway'

@Module({
  imports: [WaSessionModule],
  controllers: [InternalController],
  providers: [
    InternalService,
    InternalSecretGuard,
    InternalCron,
    PrismaService,
    {
      // WA_PROVIDER=internal -> in-process Baileys (admin-controlled).
      // anything else -> existing external gateway (openwa bridge, fonnte).
      provide: GATEWAY_FACTORY,
      inject: [InternalWaGateway],
      useFactory: (internal: InternalWaGateway) => () =>
        process.env.WA_PROVIDER === 'internal' ? internal : createGateway()
    }
  ]
})
export class InternalModule {}
