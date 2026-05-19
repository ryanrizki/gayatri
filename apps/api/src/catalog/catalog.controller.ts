import { Controller, Get, Param, Query } from '@nestjs/common'
import { CatalogService } from './catalog.service'

@Controller('catalog')
export class CatalogController {
  constructor(private svc: CatalogService) {}

  @Get('banners')
  banners() {
    return this.svc.banners()
  }

  @Get('services')
  services() {
    return this.svc.services()
  }

  @Get('services/:slug')
  service(@Param('slug') slug: string) {
    return this.svc.serviceBySlug(slug)
  }

  @Get('products')
  products(@Query('category') category?: string) {
    return this.svc.products(category)
  }

  @Get('products/:slug')
  product(@Param('slug') slug: string) {
    return this.svc.productBySlug(slug)
  }

  @Get('categories')
  categories() {
    return this.svc.categories()
  }
}
