import { Module } from '@nestjs/common'
import { WaSessionService } from './wa-session.service'
import { WaSessionController } from './wa-session.controller'
import { InternalWaGateway } from './internal-wa.gateway'
import { AdminModule } from '../admin/admin.module'

/**
 * Owns the in-process Baileys session and exposes admin endpoints to
 * connect/disconnect via the UI. Exports InternalWaGateway for the WA drain.
 * Imports AdminModule for the auth + role guards.
 */
@Module({
  imports: [AdminModule],
  controllers: [WaSessionController],
  providers: [WaSessionService, InternalWaGateway],
  exports: [WaSessionService, InternalWaGateway]
})
export class WaSessionModule {}
