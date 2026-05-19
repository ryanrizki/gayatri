import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma.service'

@Injectable()
export class CatalogService {
  constructor(private db: PrismaService) {}

  banners() {
    const now = new Date()
    return this.db.banner.findMany({
      where: {
        active: true,
        OR: [
          { startAt: null, endAt: null },
          { startAt: { lte: now }, endAt: { gte: now } },
          { startAt: { lte: now }, endAt: null },
          { startAt: null, endAt: { gte: now } }
        ]
      },
      orderBy: { order: 'asc' }
    })
  }

  services() {
    return this.db.service.findMany({
      where: { active: true },
      orderBy: { createdAt: 'asc' }
    })
  }

  async serviceBySlug(slug: string) {
    const s = await this.db.service.findUnique({ where: { slug } })
    if (!s || !s.active) throw new NotFoundException('Service not found')
    return s
  }

  products(categorySlug?: string) {
    return this.db.product.findMany({
      where: {
        active: true,
        ...(categorySlug ? { category: { slug: categorySlug } } : {})
      },
      include: { category: true },
      orderBy: { createdAt: 'asc' }
    })
  }

  async productBySlug(slug: string) {
    const p = await this.db.product.findUnique({
      where: { slug },
      include: { category: true }
    })
    if (!p || !p.active) throw new NotFoundException('Product not found')
    return p
  }

  categories() {
    return this.db.category.findMany({ orderBy: { order: 'asc' } })
  }
}
