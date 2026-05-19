import {
  BadRequestException,
  Injectable,
  NotFoundException,
  ConflictException
} from '@nestjs/common'
import { PrismaService } from '../prisma.service'
import { WaService } from '../wa/wa.service'
import type { CheckoutStatus } from '@gayatri/types'

@Injectable()
export class AdminCheckoutService {
  constructor(private db: PrismaService, private wa: WaService) {}

  list(opts: { status?: CheckoutStatus; q?: string; limit?: number; skip?: number }) {
    return this.db.checkout.findMany({
      where: {
        ...(opts.status ? { status: opts.status } : {}),
        ...(opts.q
          ? {
              OR: [
                { code: { contains: opts.q, mode: 'insensitive' } },
                { customer: { name: { contains: opts.q, mode: 'insensitive' } } },
                { customer: { phone: { contains: opts.q } } }
              ]
            }
          : {})
      },
      include: { customer: true, items: true, branch: true, child: true },
      orderBy: { createdAt: 'desc' },
      take: opts.limit ?? 50,
      skip: opts.skip ?? 0
    })
  }

  async detail(id: string) {
    const c = await this.db.checkout.findUnique({
      where: { id },
      include: {
        customer: true,
        items: true,
        branch: true,
        child: true,
        therapist: true,
        waLogs: { orderBy: { createdAt: 'desc' }, take: 20 }
      }
    })
    if (!c) throw new NotFoundException('Checkout not found')
    return c
  }

  async confirm(id: string, body: { scheduledAt: string; branchId?: string; therapistId?: string }, adminUserId: string) {
    const c = await this.db.checkout.findUnique({ where: { id }, include: { items: true } })
    if (!c) throw new NotFoundException('Checkout not found')
    if (c.status !== 'NEW' && c.status !== 'CANCELLED') {
      throw new BadRequestException(`Cannot confirm from status ${c.status}`)
    }

    // Stock check + decrement (in transaction)
    await this.db.$transaction(async (tx) => {
      for (const it of c.items) {
        if (it.type === 'PRODUCT' && it.productId) {
          const p = await tx.product.findUnique({ where: { id: it.productId } })
          if (!p) throw new NotFoundException(`Product ${it.productId} missing`)
          if (p.stock < it.qty) {
            throw new ConflictException(`Stok ${p.name} kurang (${p.stock}/${it.qty})`)
          }
          await tx.product.update({
            where: { id: p.id },
            data: { stock: { decrement: it.qty } }
          })
        }
      }
      await tx.checkout.update({
        where: { id },
        data: {
          status: 'CONFIRMED',
          scheduledAt: new Date(body.scheduledAt),
          branchId: body.branchId ?? null,
          therapistId: body.therapistId ?? null,
          reminderH1Sent: false,
          reminderH3Sent: false
        }
      })
      await tx.auditLog.create({
        data: {
          adminUserId,
          checkoutId: id,
          action: 'CONFIRM',
          payload: body as object
        }
      })
    })

    await this.wa.notifyConfirmed(id).catch(() => null)
    return this.detail(id)
  }

  async reschedule(id: string, body: { scheduledAt: string }, adminUserId: string) {
    const c = await this.db.checkout.findUnique({ where: { id } })
    if (!c) throw new NotFoundException('Checkout not found')
    if (!['CONFIRMED', 'RESCHEDULED'].includes(c.status)) {
      throw new BadRequestException(`Cannot reschedule from status ${c.status}`)
    }
    await this.db.checkout.update({
      where: { id },
      data: {
        status: 'RESCHEDULED',
        scheduledAt: new Date(body.scheduledAt),
        reminderH1Sent: false,
        reminderH3Sent: false
      }
    })
    await this.db.auditLog.create({
      data: { adminUserId, checkoutId: id, action: 'RESCHEDULE', payload: body as object }
    })
    await this.wa.notifyRescheduled(id).catch(() => null)
    return this.detail(id)
  }

  async cancel(id: string, body: { reason: string }, adminUserId: string) {
    const c = await this.db.checkout.findUnique({ where: { id }, include: { items: true } })
    if (!c) throw new NotFoundException('Checkout not found')
    if (c.status === 'CANCELLED' || c.status === 'DONE') {
      throw new BadRequestException(`Cannot cancel from status ${c.status}`)
    }

    await this.db.$transaction(async (tx) => {
      // Restock if previously confirmed
      if (c.status !== 'NEW') {
        for (const it of c.items) {
          if (it.type === 'PRODUCT' && it.productId) {
            await tx.product.update({
              where: { id: it.productId },
              data: { stock: { increment: it.qty } }
            })
          }
        }
      }
      await tx.checkout.update({
        where: { id },
        data: { status: 'CANCELLED', cancelReason: body.reason }
      })
      await tx.auditLog.create({
        data: { adminUserId, checkoutId: id, action: 'CANCEL', payload: body as object }
      })
    })

    await this.wa.notifyCancelled(id).catch(() => null)
    return this.detail(id)
  }

  async markOngoing(id: string, adminUserId: string) {
    await this.db.checkout.update({ where: { id }, data: { status: 'ONGOING' } })
    await this.db.auditLog.create({ data: { adminUserId, checkoutId: id, action: 'ONGOING' } })
    return this.detail(id)
  }

  async markDone(id: string, adminUserId: string, sendThanks = true) {
    await this.db.checkout.update({
      where: { id },
      data: { status: 'DONE', doneAt: new Date() }
    })
    await this.db.auditLog.create({ data: { adminUserId, checkoutId: id, action: 'DONE' } })
    if (sendThanks) await this.wa.notifyDone(id).catch(() => null)
    return this.detail(id)
  }
}
