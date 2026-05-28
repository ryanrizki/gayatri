'use client'

import { useEffect } from 'react'

const RELOAD_GUARD_KEY = '__chunk_reload_attempt__'

export default function GlobalError({
  error,
  reset
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const isChunkError =
    error.name === 'ChunkLoadError' ||
    /Loading chunk \d+ failed/.test(error.message) ||
    /Failed to fetch dynamically imported module/.test(error.message)

  useEffect(() => {
    if (!isChunkError || typeof window === 'undefined') return
    if (sessionStorage.getItem(RELOAD_GUARD_KEY)) return
    sessionStorage.setItem(RELOAD_GUARD_KEY, '1')
    window.location.reload()
  }, [isChunkError])

  return (
    <html lang="id">
      <body
        style={{
          margin: 0,
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#fdfaf4',
          color: '#1f1b16',
          fontFamily: 'system-ui, -apple-system, "Segoe UI", sans-serif'
        }}
      >
        <div style={{ maxWidth: 420, padding: 24, textAlign: 'center' }}>
          <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 8 }}>
            Terjadi kesalahan
          </h2>
          <p style={{ marginBottom: 16, color: '#5b5346' }}>
            {isChunkError
              ? 'Memuat ulang halaman…'
              : 'Mohon coba lagi. Jika masalah berlanjut, segarkan halaman.'}
          </p>
          <button
            onClick={() => reset()}
            style={{
              padding: '8px 16px',
              borderRadius: 8,
              border: '1px solid #d6cdb8',
              background: '#fff',
              cursor: 'pointer',
              fontSize: 14
            }}
          >
            Coba lagi
          </button>
        </div>
      </body>
    </html>
  )
}
