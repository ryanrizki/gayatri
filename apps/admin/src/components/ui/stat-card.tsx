import Link from 'next/link'
import { cn } from '@/lib/cn'

export function StatCard({
  label,
  value,
  icon,
  href,
  badge,
  badgeTone = 'neutral'
}: {
  label: string
  value: string
  icon: string
  href?: string
  badge?: string
  badgeTone?: 'up' | 'down' | 'neutral'
}) {
  const inner = (
    <div className="flex h-full flex-col rounded-xl border border-outline-soft/30 bg-white p-5 transition-shadow hover:shadow-glow">
      <div className="mb-5 flex items-start justify-between">
        <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-gayatri-50 text-gayatri-600">
          <span className="material-symbols-outlined text-[20px]">{icon}</span>
        </span>
        {badge && (
          <span
            className={cn(
              'rounded-full px-2 py-0.5 text-[11px] font-semibold',
              badgeTone === 'up' && 'bg-emerald-50 text-emerald-700',
              badgeTone === 'down' && 'bg-red-50 text-red-700',
              badgeTone === 'neutral' && 'bg-cream-200 text-charcoal-soft'
            )}
          >
            {badge}
          </span>
        )}
      </div>
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-charcoal-soft">{label}</p>
      <p className="mt-1.5 font-display text-3xl font-semibold text-gayatri-600">{value}</p>
    </div>
  )

  return href ? (
    <Link href={href} className="block">
      {inner}
    </Link>
  ) : (
    inner
  )
}
