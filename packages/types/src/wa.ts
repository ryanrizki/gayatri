import { z } from 'zod'

export const WaTemplateCode = z.enum([
  'T-ADM-001',
  'T-ADM-002',
  'T-CUS-001',
  'T-CUS-002',
  'T-CUS-003',
  'T-CUS-004',
  'T-CUS-005',
  'T-CUS-006',
  'T-CUS-007'
])
export type WaTemplateCode = z.infer<typeof WaTemplateCode>

export const WaSendJob = z.object({
  logId: z.string(),
  to: z.string(),
  body: z.string()
})
export type WaSendJob = z.infer<typeof WaSendJob>
