import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException
} from '@nestjs/common'
import { createHash, randomBytes } from 'node:crypto'
import { PrismaService } from '../prisma.service'
import { WaService } from '../wa/wa.service'
import type { CheckoutSubmit } from '@gayatri/types'
import { normalizePhone } from '@gayatri/wa'

const CART_HASH_DEDUPE_MIN = 5

function genCode(): string {
  const part = randomBytes(3).toString('hex').toUpperCase()
  const ts = Date.now().toString(36).toUpperCase().slice(-4)
  return `GYT-${ts}-${part}`
}

function cartHash(items: { type: string; serviceId?: string; productId?: string; qty: number }[]): string {
  const key = items
    .map((i) => `${i.type}:${i.serviceId ?? i.productId}:${i.qty}`)
    .sort()
    .join('|')
  return createHash('sha1').update(key).digest('hex').slice(0, 16)
}

@Injectable()
export class CheckoutService {
  constructor(private db: PrismaService, private wa: WaService) {}

  async submit(input: CheckoutSubmit) {
    const phone = normalizePhone(input.customer.phone)
    if (!phone) throw new BadRequestException('Invalid phone')

    // Resolve items + snapshot price (server-side trust)
    const serviceIds = input.items.filter((i) => i.type === 'SERVICE').map((i) => i.serviceId!)
    const productIds = input.items.filter((i) => i.type === 'PRODUCT').map((i) => i.productId!)
    const [services, products] = await Promise.all([
      serviceIds.length
        ? this.db.service.findMany({ where: { id: { in: serviceIds }, active: true } })
        : Promise.resolve([]),
      productIds.length
        ? this.db.product.findMany({ where: { id: { in: productIds }, active: true } })
        : Promise.resolve([])
    ])
    const sMap = new Map(services.map((s) => [s.id, s]))
    const pMap = new Map(products.map((p) => [p.id, p]))

    const items = input.items.map((i) => {
      if (i.type === 'SERVICE') {
        const s = sMap.get(i.serviceId!)
        if (!s) throw new NotFoundException(`Service ${i.serviceId} not found`)
        return {
          type: 'SERVICE' as const,
          serviceId: s.id,
          productId: null,
          name: s.name,
          priceIdr: s.priceIdr,
          qty: i.qty ?? 1
        }
      } else {
        const p = pMap.get(i.productId!)
        if (!p) throw new NotFoundException(`Product ${i.productId} not found`)
        return {
          type: 'PRODUCT' as const,
          productId: p.id,
          serviceId: null,
          name: p.name,
          priceIdr: p.priceIdr,
          qty: i.qty ?? 1
        }
      }
    })

    const totalIdr = items.reduce((acc, it) => acc + it.priceIdr * it.qty, 0)
    const hash = cartHash(input.items.map((i) => ({ type: i.type, serviceId: i.serviceId, productId: i.productId, qty: i.qty ?? 1 })))

    // Dedupe: same phone + cartHash in last 5 min
    const dedupeSince = new Date(Date.now() - CART_HASH_DEDUPE_MIN * 60_000)
    const dup = await this.db.checkout.findFirst({
      where: {
        cartHash: hash,
        customer: { phone },
        createdAt: { gte: dedupeSince }
      }
    })
    if (dup) throw new ConflictException('Duplicate checkout (5 min window)')

    // Upsert customer
    const customer = await this.db.customer.upsert({
      where: { phone },
      update: {
        name: input.customer.name,
        ...(input.customer.email ? { email: input.customer.email } : {}),
        ...(input.customer.address ? { address: input.customer.address } : {})
      },
      create: {
        phone,
        name: input.customer.name,
        email: input.customer.email || null,
        address: input.customer.address || null
      }
    })

    // Optional child
    let childId: string | null = null
    if (input.child) {
      const c = await this.db.child.create({
        data: {
          customerId: customer.id,
          name: input.child.name,
          ageMonth: input.child.ageMonth ?? null,
          gender: input.child.gender ?? null
        }
      })
      childId = c.id
    }

    const checkout = await this.db.checkout.create({
      data: {
        code: genCode(),
        customerId: customer.id,
        childId,
        totalIdr,
        preferredDate: input.preferredDate ? new Date(input.preferredDate) : null,
        notes: input.notes ?? null,
        cartHash: hash,
        items: { create: items }
      },
      include: { items: true, customer: true, child: true }
    })

    // Fire WA: customer ack + admin new
    await this.wa.notifyCheckoutReceived(checkout.id).catch(() => null)
    await this.wa.notifyAdminNewCheckout(checkout.id).catch(() => null)

    return {
      code: checkout.code,
      status: checkout.status,
      totalIdr: checkout.totalIdr,
      message: 'Checkout diterima. Admin akan menghubungi via WhatsApp.'
    }
  }

  async statusByCode(code: string, phone: string) {
    const norm = normalizePhone(phone)
    if (!norm) throw new BadRequestException('Invalid phone')
    const c = await this.db.checkout.findFirst({
      where: { code, customer: { phone: norm } },
      include: { items: true, branch: true }
    })
    if (!c) throw new NotFoundException('Checkout not found')
    return {
      code: c.code,
      status: c.status,
      totalIdr: c.totalIdr,
      scheduledAt: c.scheduledAt,
      branch: c.branch?.name ?? null,
      items: c.items.map((i) => ({ name: i.name, qty: i.qty, priceIdr: i.priceIdr }))
    }
  }
}
