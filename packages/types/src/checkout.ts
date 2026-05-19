import { z } from 'zod'

export const phoneRegex = /^(?:\+?62|0)8[1-9][0-9]{6,11}$/

export const CheckoutItemInput = z.object({
  type: z.enum(['SERVICE', 'PRODUCT']),
  serviceId: z.string().cuid().optional(),
  productId: z.string().cuid().optional(),
  qty: z.number().int().min(1).max(99).default(1)
}).refine(
  (v) => (v.type === 'SERVICE' ? !!v.serviceId : !!v.productId),
  { message: 'serviceId required for SERVICE / productId required for PRODUCT' }
)
export type CheckoutItemInput = z.infer<typeof CheckoutItemInput>

export const CheckoutSubmit = z.object({
  customer: z.object({
    name: z.string().min(2).max(100),
    phone: z.string().regex(phoneRegex, 'Nomor WhatsApp tidak valid'),
    email: z.string().email().optional().or(z.literal('')),
    address: z.string().max(500).optional()
  }),
  child: z.object({
    name: z.string().min(1).max(100),
    ageMonth: z.number().int().min(0).max(120).optional(),
    gender: z.enum(['L', 'P']).optional()
  }).optional(),
  items: z.array(CheckoutItemInput).min(1).max(20),
  preferredDate: z.string().datetime().optional(),
  notes: z.string().max(1000).optional()
})
export type CheckoutSubmit = z.infer<typeof CheckoutSubmit>

export const CheckoutStatus = z.enum([
  'NEW',
  'CONFIRMED',
  'RESCHEDULED',
  'ONGOING',
  'DONE',
  'CANCELLED'
])
export type CheckoutStatus = z.infer<typeof CheckoutStatus>

export const ConfirmCheckout = z.object({
  scheduledAt: z.string().datetime(),
  branchId: z.string().cuid().optional(),
  therapistId: z.string().cuid().optional()
})
export type ConfirmCheckout = z.infer<typeof ConfirmCheckout>

export const RescheduleCheckout = z.object({
  scheduledAt: z.string().datetime()
})
export type RescheduleCheckout = z.infer<typeof RescheduleCheckout>

export const CancelCheckout = z.object({
  reason: z.string().min(1).max(500)
})
export type CancelCheckout = z.infer<typeof CancelCheckout>
