import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Query, UseGuards } from '@nestjs/common'
import { AdminAuthGuard } from './auth.guard'
import { AdminRolesGuard } from './roles.guard'
import { Roles } from './roles.decorator'
import { AdminCatalogService } from './catalog.service'
import { ZodValidationPipe } from '../common/zod-validation.pipe'
import {
  ServiceCreate,
  ServiceUpdate,
  ProductCreate,
  ProductUpdate,
  CategoryCreate,
  CategoryUpdate,
  BannerCreate,
  BannerUpdate,
  BranchCreate,
  BranchUpdate,
  TherapistCreate,
  TherapistUpdate,
  CustomerUpdate,
  WaTemplateUpdate,
  SettingsUpsert
} from '@gayatri/types'

@Controller('admin')
@UseGuards(AdminAuthGuard, AdminRolesGuard)
export class AdminCatalogController {
  constructor(private svc: AdminCatalogService) {}

  @Get('dashboard')
  dashboard() { return this.svc.dashboard() }

  // Services
  @Get('services') listServices() { return this.svc.listServices() }
  @Get('services/:id') getService(@Param('id') id: string) { return this.svc.getService(id) }
  @Post('services')
  @Roles('OWNER', 'ADMIN')
  createService(@Body(new ZodValidationPipe(ServiceCreate)) body: ServiceCreate) {
    return this.svc.createService(body)
  }
  @Patch('services/:id')
  @Roles('OWNER', 'ADMIN')
  updateService(@Param('id') id: string, @Body(new ZodValidationPipe(ServiceUpdate)) body: ServiceUpdate) {
    return this.svc.updateService(id, body)
  }
  @Delete('services/:id')
  @Roles('OWNER', 'ADMIN')
  deleteService(@Param('id') id: string) { return this.svc.deleteService(id) }

  // Products
  @Get('products') listProducts() { return this.svc.listProducts() }
  @Get('products/:id') getProduct(@Param('id') id: string) { return this.svc.getProduct(id) }
  @Post('products')
  @Roles('OWNER', 'ADMIN')
  createProduct(@Body(new ZodValidationPipe(ProductCreate)) body: ProductCreate) {
    return this.svc.createProduct(body)
  }
  @Patch('products/:id')
  @Roles('OWNER', 'ADMIN')
  updateProduct(@Param('id') id: string, @Body(new ZodValidationPipe(ProductUpdate)) body: ProductUpdate) {
    return this.svc.updateProduct(id, body)
  }
  @Delete('products/:id')
  @Roles('OWNER', 'ADMIN')
  deleteProduct(@Param('id') id: string) { return this.svc.deleteProduct(id) }

  // Categories
  @Get('categories') listCategories() { return this.svc.listCategories() }
  @Post('categories')
  @Roles('OWNER', 'ADMIN')
  createCategory(@Body(new ZodValidationPipe(CategoryCreate)) body: CategoryCreate) {
    return this.svc.createCategory(body)
  }
  @Patch('categories/:id')
  @Roles('OWNER', 'ADMIN')
  updateCategory(@Param('id') id: string, @Body(new ZodValidationPipe(CategoryUpdate)) body: CategoryUpdate) {
    return this.svc.updateCategory(id, body)
  }
  @Delete('categories/:id')
  @Roles('OWNER', 'ADMIN')
  deleteCategory(@Param('id') id: string) { return this.svc.deleteCategory(id) }

  // Banners
  @Get('banners') listBanners() { return this.svc.listBanners() }
  @Post('banners')
  @Roles('OWNER', 'ADMIN')
  createBanner(@Body(new ZodValidationPipe(BannerCreate)) body: BannerCreate) {
    return this.svc.createBanner(body)
  }
  @Patch('banners/:id')
  @Roles('OWNER', 'ADMIN')
  updateBanner(@Param('id') id: string, @Body(new ZodValidationPipe(BannerUpdate)) body: BannerUpdate) {
    return this.svc.updateBanner(id, body)
  }
  @Delete('banners/:id')
  @Roles('OWNER', 'ADMIN')
  deleteBanner(@Param('id') id: string) { return this.svc.deleteBanner(id) }

  // Branches
  @Get('branches') listBranches() { return this.svc.listBranches() }
  @Post('branches')
  @Roles('OWNER', 'ADMIN')
  createBranch(@Body(new ZodValidationPipe(BranchCreate)) body: BranchCreate) {
    return this.svc.createBranch(body)
  }
  @Patch('branches/:id')
  @Roles('OWNER', 'ADMIN')
  updateBranch(@Param('id') id: string, @Body(new ZodValidationPipe(BranchUpdate)) body: BranchUpdate) {
    return this.svc.updateBranch(id, body)
  }

  // Therapists
  @Get('therapists') listTherapists() { return this.svc.listTherapists() }
  @Post('therapists')
  @Roles('OWNER', 'ADMIN')
  createTherapist(@Body(new ZodValidationPipe(TherapistCreate)) body: TherapistCreate) {
    return this.svc.createTherapist(body)
  }
  @Patch('therapists/:id')
  @Roles('OWNER', 'ADMIN')
  updateTherapist(@Param('id') id: string, @Body(new ZodValidationPipe(TherapistUpdate)) body: TherapistUpdate) {
    return this.svc.updateTherapist(id, body)
  }

  // Customers
  @Get('customers') listCustomers(
    @Query('q') q?: string,
    @Query('limit') limit?: string,
    @Query('skip') skip?: string
  ) {
    return this.svc.listCustomers({
      q,
      limit: limit ? Number(limit) : undefined,
      skip: skip ? Number(skip) : undefined
    })
  }
  @Get('customers/:id') getCustomer(@Param('id') id: string) { return this.svc.getCustomer(id) }
  @Patch('customers/:id')
  @Roles('OWNER', 'ADMIN')
  updateCustomer(@Param('id') id: string, @Body(new ZodValidationPipe(CustomerUpdate)) body: CustomerUpdate) {
    return this.svc.updateCustomer(id, body)
  }

  // Settings — owner/admin only
  @Get('settings')
  @Roles('OWNER', 'ADMIN')
  listSettings() { return this.svc.listSettings() }

  @Put('settings')
  @Roles('OWNER', 'ADMIN')
  upsertSettings(@Body(new ZodValidationPipe(SettingsUpsert)) body: SettingsUpsert) {
    return this.svc.upsertSettings(body)
  }

  // WA Templates — owner/admin only
  @Get('wa-templates')
  @Roles('OWNER', 'ADMIN')
  listWaTemplates() { return this.svc.listWaTemplates() }

  @Put('wa-templates/:code')
  @Roles('OWNER', 'ADMIN')
  updateWaTemplate(@Param('code') code: string, @Body(new ZodValidationPipe(WaTemplateUpdate)) body: WaTemplateUpdate) {
    return this.svc.updateWaTemplate(code, body)
  }

  // WA Logs — owner/admin only
  @Get('wa-logs')
  @Roles('OWNER', 'ADMIN')
  listWaLogs(@Query('checkoutId') checkoutId?: string, @Query('status') status?: string, @Query('limit') limit?: string) {
    return this.svc.listWaLogs({ checkoutId, status, limit: limit ? Number(limit) : undefined })
  }
}
