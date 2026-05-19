const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000'

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {})
    },
    cache: init?.cache ?? 'no-store'
  })
  if (!res.ok) {
    let detail: unknown
    try { detail = await res.json() } catch { detail = await res.text() }
    throw new Error(`api ${path}: ${res.status} ${JSON.stringify(detail)}`)
  }
  return res.json() as Promise<T>
}
