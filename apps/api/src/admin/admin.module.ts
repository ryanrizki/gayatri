import { Module } from '@nestjs/common'
import { AdminAuthController } from './auth.controller'
import { AdminAuthService } from './auth.service'
import { AdminCheckoutController } from './checkouts.controller'
import { AdminCheckoutService } from './checkouts.service'
import { AdminCatalogController } from './catalog.controller'
import { AdminCatalogService } from './catalog.service'
import { PrismaService } from '../prisma.service'
import { WaModule } from '../wa/wa.module'
import { AdminAuthGuard } from './auth.guard'
import { AdminRolesGuard } from './roles.guard'

@Module({
  imports: [WaModule],
  controllers: [AdminAuthController, AdminCheckoutController, AdminCatalogController],
  providers: [
    AdminAuthService,
    AdminCheckoutService,
    AdminCatalogService,
    PrismaService,
    AdminAuthGuard,
    AdminRolesGuard
  ],
  exports: [AdminAuthGuard, AdminRolesGuard, AdminAuthService]
})
export class AdminModule {}
