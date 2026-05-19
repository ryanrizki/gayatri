import type { ReactNode } from 'react'

export function FormSection({
  title,
  description,
  children
}: {
  title: string
  description?: string
  children: ReactNode
}) {
  return (
    <div className="grid grid-cols-1 gap-6 border-b border-outline-soft/30 py-8 first:pt-0 last:border-b-0 last:pb-0 lg:grid-cols-3">
      <div className="lg:col-span-1">
        <h2 className="text-base font-semibold text-charcoal">{title}</h2>
        {description && <p className="mt-1 text-sm text-charcoal-soft">{description}</p>}
      </div>
      <div className="lg:col-span-2">{children}</div>
    </div>
  )
}
