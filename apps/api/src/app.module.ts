import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler'
import { APP_GUARD } from '@nestjs/core'
import { HealthController } from './health.controller'
import { CatalogModule } from './catalog/catalog.module'
import { CheckoutModule } from './checkout/checkout.module'
import { AdminModule } from './admin/admin.module'
import { WaModule } from './wa/wa.module'
import { InternalModule } from './internal/internal.module'

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([
      { name: 'default', ttl: 60_000, limit: 60 },
      { name: 'login', ttl: 60_000, limit: 5 }
    ]),
    CatalogModule,
    CheckoutModule,
    AdminModule,
    WaModule,
    InternalModule
  ],
  controllers: [HealthController],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }]
})
export class AppModule {}
