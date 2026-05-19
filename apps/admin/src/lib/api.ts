const API_ROOT = (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000').replace(/\/+$/, '')
const API_BASE = `${API_ROOT}/v1`

export class ApiError extends Error {
  status: number
  data: unknown
  constructor(message: string, status: number, data: unknown) {
    super(message)
    this.status = status
    this.data = data
  }
}

type Options = {
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE'
  body?: unknown
  query?: Record<string, string | number | undefined>
  signal?: AbortSignal
}

export async function adminApi<T = unknown>(path: string, opts: Options = {}): Promise<T> {
  const { method = 'GET', body, query, signal } = opts
  const qs = query
    ? '?' +
      new URLSearchParams(
        Object.entries(query)
          .filter(([, v]) => v !== undefined && v !== '')
          .map(([k, v]) => [k, String(v)])
      ).toString()
    : ''

  const res = await fetch(`${API_BASE}${path}${qs}`, {
    method,
    credentials: 'include',
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
    signal,
    cache: 'no-store'
  })

  if (res.status === 401 && typeof window !== 'undefined' && !path.startsWith('/admin/auth')) {
    window.location.href = '/login'
    throw new ApiError('Unauthorized', 401, null)
  }

  const isJson = res.headers.get('content-type')?.includes('application/json')
  const data = isJson ? await res.json() : await res.text()

  if (!res.ok) {
    const msg = (data as { message?: string })?.message ?? `Request failed (${res.status})`
    throw new ApiError(typeof msg === 'string' ? msg : 'Request failed', res.status, data)
  }
  return data as T
}
