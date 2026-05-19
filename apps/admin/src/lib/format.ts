export function formatIdr(n: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n)
}

export function formatDate(d: string | Date | null | undefined, opts?: Intl.DateTimeFormatOptions) {
  if (!d) return '—'
  return new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'short',
    ...opts
  }).format(typeof d === 'string' ? new Date(d) : d)
}

export function formatDateShort(d: string | Date | null | undefined) {
  if (!d) return '—'
  return new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium' }).format(typeof d === 'string' ? new Date(d) : d)
}

export function relativeTime(d: string | Date) {
  const ms = (typeof d === 'string' ? new Date(d) : d).getTime() - Date.now()
  const abs = Math.abs(ms)
  const min = 60_000
  const hour = 60 * min
  const day = 24 * hour
  const rtf = new Intl.RelativeTimeFormat('id-ID', { numeric: 'auto' })
  if (abs < hour) return rtf.format(Math.round(ms / min), 'minute')
  if (abs < day) return rtf.format(Math.round(ms / hour), 'hour')
  return rtf.format(Math.round(ms / day), 'day')
}
