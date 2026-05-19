import type { ReactNode } from 'react'

export function PageHeader({
  title,
  description,
  action
}: {
  title: string
  description?: string
  action?: ReactNode
}) {
  return (
    <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
      <div>
        <h1 className="font-display text-2xl font-medium text-gayatri-600 md:text-3xl">{title}</h1>
        {description && <p className="text-sm text-charcoal-soft">{description}</p>}
      </div>
      {action}
    </div>
  )
}
