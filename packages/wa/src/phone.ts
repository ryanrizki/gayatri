/**
 * Normalize Indonesian phone to international format without leading +
 * Accepts: 08xxx, +628xxx, 628xxx, 8xxx
 * Returns: 628xxx or null if invalid
 */
export function normalizePhone(raw: string): string | null {
  if (!raw) return null
  let p = raw.replace(/[^\d+]/g, '')
  if (p.startsWith('+')) p = p.slice(1)
  if (p.startsWith('0')) p = '62' + p.slice(1)
  else if (p.startsWith('8')) p = '62' + p
  if (!p.startsWith('62')) return null
  if (p.length < 10 || p.length > 15) return null
  return p
}
