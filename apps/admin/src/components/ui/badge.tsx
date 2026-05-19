import { cva, type VariantProps } from 'class-variance-authority'
import type { HTMLAttributes } from 'react'
import { cn } from '@/lib/cn'

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold tracking-wide',
  {
    variants: {
      tone: {
        neutral: 'bg-cream-200 text-charcoal-soft',
        sage: 'bg-gayatri-50 text-gayatri-600',
        blue: 'bg-blue-50 text-blue-700',
        amber: 'bg-amber-50 text-amber-700',
        green: 'bg-emerald-50 text-emerald-700',
        red: 'bg-red-50 text-red-700',
        violet: 'bg-violet-50 text-violet-700'
      }
    },
    defaultVariants: { tone: 'neutral' }
  }
)

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {}

export function Badge({ className, tone, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ tone }), className)} {...props} />
}

const STATUS_TONE: Record<string, BadgeProps['tone']> = {
  NEW: 'amber',
  CONFIRMED: 'blue',
  RESCHEDULED: 'violet',
  ONGOING: 'sage',
  DONE: 'green',
  CANCELLED: 'red'
}
const STATUS_LABEL: Record<string, string> = {
  NEW: 'Baru',
  CONFIRMED: 'Dikonfirmasi',
  RESCHEDULED: 'Dijadwal Ulang',
  ONGOING: 'Berjalan',
  DONE: 'Selesai',
  CANCELLED: 'Dibatalkan'
}

export function StatusBadge({ status }: { status: string }) {
  return <Badge tone={STATUS_TONE[status] ?? 'neutral'}>{STATUS_LABEL[status] ?? status}</Badge>
}
