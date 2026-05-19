import type { ReactNode } from 'react'

export function EmptyState({
  icon = 'inbox',
  title,
  description,
  action
}: {
  icon?: string
  title: string
  description?: string
  action?: ReactNode
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-outline-soft/40 bg-cream-100 px-6 py-16 text-center">
      <span className="material-symbols-outlined text-5xl text-gayatri-300">{icon}</span>
      <p className="text-base font-semibold text-charcoal">{title}</p>
      {description && <p className="max-w-sm text-sm text-charcoal-soft">{description}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  )
}

export function Spinner({ className }: { className?: string }) {
  return (
    <span className={`material-symbols-outlined animate-spin text-gayatri-600 ${className ?? 'text-[24px]'}`}>
      progress_activity
    </span>
  )
}
