import { Injectable, Logger } from '@nestjs/common'
import { PrismaService } from '../prisma.service'
import { normalizePhone } from '@gayatri/wa'
import type { WaTemplateCode } from '@gayatri/types'

@Injectable()
export class WaService {
  private readonly logger = new Logger(WaService.name)

  constructor(private db: PrismaService) {}

  private async settings() {
    const rows = await this.db.setting.findMany()
    return Object.fromEntries(rows.map((r) => [r.key, r.value]))
  }

  private fmtIdr(n: number): string {
    return n.toLocaleString('id-ID')
  }

  private fmtDate(d: Date | null | undefined): string {
    if (!d) return '-'
    return d.toLocaleString('id-ID', { timeZone: 'Asia/Jakarta', dateStyle: 'full', timeStyle: 'short' })
  }

  private fmtTimeOnly(d: Date | null | undefined): string {
    if (!d) return '-'
    return d.toLocaleTimeString('id-ID', { timeZone: 'Asia/Jakarta', hour: '2-digit', minute: '2-digit' })
  }

  /**
   * Persists a QUEUED WaLog row; the message is rendered + sent later by the
   * /internal/tick drain (InternalService.drainWaJobs) from template + payload.
   * Note: if the template body is edited between enqueue and drain, the sent
   * message reflects the body at SEND time, not enqueue time.
   */
  async enqueue(opts: {
    to: string
    templateCode: WaTemplateCode | string
    vars: Record<string, string | number | undefined | null>
    checkoutId?: string
  }) {
    const target = normalizePhone(opts.to)
    if (!target) {
      this.logger.warn(`Invalid WA target: ${opts.to}`)
      return null
    }
    const tpl = await this.db.waTemplate.findUnique({ where: { code: opts.templateCode } })
    if (!tpl || !tpl.active) {
      this.logger.warn(`Template ${opts.templateCode} missing/inactive`)
      return null
    }

    const log = await this.db.waLog.create({
      data: {
        checkoutId: opts.checkoutId ?? null,
        to: target,
        template: opts.templateCode,
        payload: opts.vars as object,
        status: 'QUEUED',
        provider: process.env.WA_PROVIDER ?? 'fonnte'
      }
    })

    return log.id
  }

  async notifyCheckoutReceived(checkoutId: string) {
    const c = await this.db.checkout.findUniqueOrThrow({
      where: { id: checkoutId },
      include: { customer: true }
    })
    return this.enqueue({
      to: c.customer.phone,
      templateCode: 'T-CUS-001',
      vars: { name: c.customer.name, code: c.code },
      checkoutId
    })
  }

  async notifyAdminNewCheckout(checkoutId: string) {
    const c = await this.db.checkout.findUniqueOrThrow({
      where: { id: checkoutId },
      include: { customer: true, child: true, items: true }
    })
    const s = await this.settings()
    const adminNumber = s['admin_wa_number'] ?? process.env.ADMIN_WA_NUMBER ?? ''
    if (!adminNumber) {
      this.logger.warn('admin_wa_number not configured')
      return null
    }
    const itemsList = c.items
      .map((i) => `- ${i.name} x${i.qty} = Rp${this.fmtIdr(i.priceIdr * i.qty)}`)
      .join('\n')
    return this.enqueue({
      to: adminNumber,
      templateCode: 'T-ADM-001',
      vars: {
        code: c.code,
        name: c.customer.name,
        phone: c.customer.phone,
        baby_name: c.child?.name ?? '-',
        baby_age: c.child?.ageMonth ? `${c.child.ageMonth} bulan` : '-',
        address: c.customer.address ?? '-',
        items_list: itemsList,
        total: this.fmtIdr(c.totalIdr),
        preferred_date: c.preferredDate ? this.fmtDate(c.preferredDate) : '-',
        notes: c.notes ?? '-',
        admin_url: `${process.env.APP_URL_ADMIN ?? ''}/checkouts/${c.id}`
      },
      checkoutId
    })
  }

  async notifyConfirmed(checkoutId: string) {
    const c = await this.db.checkout.findUniqueOrThrow({
      where: { id: checkoutId },
      include: { customer: true, child: true, branch: true, items: true }
    })
    const serviceItem = c.items.find((i) => i.type === 'SERVICE')
    return this.enqueue({
      to: c.customer.phone,
      templateCode: 'T-CUS-002',
      vars: {
        code: c.code,
        service_name: serviceItem?.name ?? 'Layanan',
        date: c.scheduledAt ? this.fmtDate(c.scheduledAt) : '-',
        hour: c.scheduledAt ? this.fmtTimeOnly(c.scheduledAt) : '-',
        branch_address: c.branch?.address ?? '-',
        total: this.fmtIdr(c.totalIdr),
        baby_name: c.child?.name ?? c.customer.name
      },
      checkoutId
    })
  }

  async notifyRescheduled(checkoutId: string) {
    const c = await this.db.checkout.findUniqueOrThrow({
      where: { id: checkoutId },
      include: { customer: true }
    })
    return this.enqueue({
      to: c.customer.phone,
      templateCode: 'T-CUS-003',
      vars: {
        code: c.code,
        new_date: c.scheduledAt ? this.fmtDate(c.scheduledAt) : '-',
        new_hour: c.scheduledAt ? this.fmtTimeOnly(c.scheduledAt) : '-'
      },
      checkoutId
    })
  }

  async notifyCancelled(checkoutId: string) {
    const c = await this.db.checkout.findUniqueOrThrow({
      where: { id: checkoutId },
      include: { customer: true }
    })
    return this.enqueue({
      to: c.customer.phone,
      templateCode: 'T-CUS-004',
      vars: { code: c.code, reason: c.cancelReason ?? '-' },
      checkoutId
    })
  }

  async notifyReminderH1(checkoutId: string) {
    const c = await this.db.checkout.findUniqueOrThrow({
      where: { id: checkoutId },
      include: { customer: true, child: true, branch: true }
    })
    return this.enqueue({
      to: c.customer.phone,
      templateCode: 'T-CUS-005',
      vars: {
        hour: c.scheduledAt ? this.fmtTimeOnly(c.scheduledAt) : '-',
        baby_name: c.child?.name ?? c.customer.name,
        address: c.branch?.address ?? '-'
      },
      checkoutId
    })
  }

  async notifyReminderH3(checkoutId: string) {
    const c = await this.db.checkout.findUniqueOrThrow({
      where: { id: checkoutId },
      include: { customer: true, child: true }
    })
    return this.enqueue({
      to: c.customer.phone,
      templateCode: 'T-CUS-006',
      vars: { baby_name: c.child?.name ?? c.customer.name },
      checkoutId
    })
  }

  async notifyDone(checkoutId: string) {
    const c = await this.db.checkout.findUniqueOrThrow({
      where: { id: checkoutId },
      include: { customer: true, child: true }
    })
    return this.enqueue({
      to: c.customer.phone,
      templateCode: 'T-CUS-007',
      vars: { baby_name: c.child?.name ?? c.customer.name },
      checkoutId
    })
  }
}
