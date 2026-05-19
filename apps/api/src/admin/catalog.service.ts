import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma.service'

@Injectable()
export class AdminCatalogService {
  constructor(private db: PrismaService) {}

  // ---- Services ----
  listServices() {
    return this.db.service.findMany({ orderBy: { createdAt: 'desc' } })
  }
  async getService(id: string) {
    const s = await this.db.service.findUnique({ where: { id } })
    if (!s) throw new NotFoundException('Service not found')
    return s
  }
  createService(data: import('@gayatri/types').ServiceCreate) {
    return this.db.service.create({ data })
  }
  async updateService(id: string, data: import('@gayatri/types').ServiceUpdate) {
    return this.db.service.update({ where: { id }, data })
  }
  async deleteService(id: string) {
    await this.db.service.update({ where: { id }, data: { active: false } })
    return { ok: true }
  }

  // ---- Products ----
  listProducts() {
    return this.db.product.findMany({ orderBy: { createdAt: 'desc' }, include: { category: true } })
  }
  async getProduct(id: string) {
    const p = await this.db.product.findUnique({ where: { id }, include: { category: true } })
    if (!p) throw new NotFoundException('Product not found')
    return p
  }
  createProduct(data: import('@gayatri/types').ProductCreate) {
    return this.db.product.create({ data })
  }
  updateProduct(id: string, data: import('@gayatri/types').ProductUpdate) {
    return this.db.product.update({ where: { id }, data })
  }
  async deleteProduct(id: string) {
    await this.db.product.update({ where: { id }, data: { active: false } })
    return { ok: true }
  }

  // ---- Categories ----
  listCategories() {
    return this.db.category.findMany({ orderBy: { order: 'asc' } })
  }
  createCategory(data: import('@gayatri/types').CategoryCreate) {
    return this.db.category.create({ data })
  }
  updateCategory(id: string, data: import('@gayatri/types').CategoryUpdate) {
    return this.db.category.update({ where: { id }, data })
  }
  deleteCategory(id: string) {
    return this.db.category.delete({ where: { id } })
  }

  // ---- Banners ----
  listBanners() {
    return this.db.banner.findMany({ orderBy: { order: 'asc' } })
  }
  createBanner(data: import('@gayatri/types').BannerCreate) {
    return this.db.banner.create({ data })
  }
  updateBanner(id: string, data: import('@gayatri/types').BannerUpdate) {
    return this.db.banner.update({ where: { id }, data })
  }
  deleteBanner(id: string) {
    return this.db.banner.delete({ where: { id } })
  }

  // ---- Branches ----
  listBranches() {
    return this.db.branch.findMany({ orderBy: { name: 'asc' } })
  }
  createBranch(data: import('@gayatri/types').BranchCreate) {
    return this.db.branch.create({ data })
  }
  updateBranch(id: string, data: import('@gayatri/types').BranchUpdate) {
    return this.db.branch.update({ where: { id }, data })
  }

  // ---- Therapists ----
  listTherapists() {
    return this.db.therapist.findMany({ orderBy: { name: 'asc' } })
  }
  createTherapist(data: import('@gayatri/types').TherapistCreate) {
    return this.db.therapist.create({ data })
  }
  updateTherapist(id: string, data: import('@gayatri/types').TherapistUpdate) {
    return this.db.therapist.update({ where: { id }, data })
  }

  // ---- Customers ----
  listCustomers(opts: { q?: string; limit?: number; skip?: number }) {
    return this.db.customer.findMany({
      where: opts.q
        ? {
            OR: [
              { name: { contains: opts.q, mode: 'insensitive' } },
              { phone: { contains: opts.q } },
              { email: { contains: opts.q, mode: 'insensitive' } }
            ]
          }
        : undefined,
      include: { _count: { select: { checkouts: true, children: true } } },
      orderBy: { createdAt: 'desc' },
      take: opts.limit ?? 50,
      skip: opts.skip ?? 0
    })
  }
  async getCustomer(id: string) {
    const c = await this.db.customer.findUnique({
      where: { id },
      include: {
        children: true,
        checkouts: { orderBy: { createdAt: 'desc' }, take: 50, include: { items: true } }
      }
    })
    if (!c) throw new NotFoundException('Customer not found')
    return c
  }
  updateCustomer(id: string, data: import('@gayatri/types').CustomerUpdate) {
    return this.db.customer.update({ where: { id }, data })
  }

  // ---- Settings ----
  async listSettings() {
    const rows = await this.db.setting.findMany()
    return rows.reduce<Record<string, string>>((acc, r) => {
      acc[r.key] = r.value
      return acc
    }, {})
  }
  async upsertSettings(data: import('@gayatri/types').SettingsUpsert) {
    const ops = Object.entries(data).map(([key, value]) =>
      this.db.setting.upsert({
        where: { key },
        update: { value },
        create: { key, value }
      })
    )
    await this.db.$transaction(ops)
    return this.listSettings()
  }

  // ---- WA Templates ----
  listWaTemplates() {
    return this.db.waTemplate.findMany({ orderBy: { code: 'asc' } })
  }
  updateWaTemplate(code: string, data: import('@gayatri/types').WaTemplateUpdate) {
    return this.db.waTemplate.update({ where: { code }, data })
  }

  // ---- WA Logs ----
  listWaLogs(opts: { checkoutId?: string; status?: string; limit?: number }) {
    return this.db.waLog.findMany({
      where: {
        ...(opts.checkoutId ? { checkoutId: opts.checkoutId } : {}),
        ...(opts.status ? { status: opts.status as any } : {})
      },
      orderBy: { createdAt: 'desc' },
      take: opts.limit ?? 100
    })
  }

  // ---- Dashboard ----
  async dashboard() {
    const [newCount, todaySchedule, weekRevenue] = await Promise.all([
      this.db.checkout.count({ where: { status: 'NEW' } }),
      this.db.checkout.count({
        where: {
          status: { in: ['CONFIRMED', 'RESCHEDULED', 'ONGOING'] },
          scheduledAt: {
            gte: startOfDay(new Date()),
            lt: endOfDay(new Date())
          }
        }
      }),
      this.db.checkout.aggregate({
        where: {
          status: 'DONE',
          doneAt: { gte: startOfDay(daysAgo(7)) }
        },
        _sum: { totalIdr: true }
      })
    ])
    return {
      newCount,
      todaySchedule,
      weekRevenue: weekRevenue._sum.totalIdr ?? 0
    }
  }
}

function startOfDay(d: Date) {
  const x = new Date(d)
  x.setHours(0, 0, 0, 0)
  return x
}
function endOfDay(d: Date) {
  const x = new Date(d)
  x.setHours(23, 59, 59, 999)
  return x
}
function daysAgo(n: number) {
  const x = new Date()
  x.setDate(x.getDate() - n)
  return x
}
