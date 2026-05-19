export function formatIdr(amount: number) {
  return `Rp${amount.toLocaleString('id-ID')}`
}

export function formatIdrShort(amount: number) {
  if (amount >= 1_000_000) return `Rp${(amount / 1_000_000).toFixed(1).replace(/\.0$/, '')}jt`
  if (amount >= 1_000) return `Rp${Math.round(amount / 1_000)}rb`
  return `Rp${amount}`
}

export function formatDuration(min: number) {
  return `${min} Menit`
}

export function formatAgeRange(minMonth: number, maxMonth: number) {
  return `${minMonth} - ${maxMonth} Bulan`
}
