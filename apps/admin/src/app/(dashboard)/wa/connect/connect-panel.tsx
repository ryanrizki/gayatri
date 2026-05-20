'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { adminApi } from '@/lib/api'
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/catalog/PageHeader'
import { useToast } from '@/components/ui/toast'

type State = 'DISCONNECTED' | 'CONNECTING' | 'PENDING_QR' | 'CONNECTED' | 'LOGGED_OUT' | 'ERROR'

type Status = {
  state: State
  qr: string | null
  qrPng: string | null
  meId: string | null
  lastError: string | null
}

// Tailwind classes per state for the status badge.
const BADGE: Record<State, string> = {
  DISCONNECTED: 'bg-charcoal-soft/15 text-charcoal',
  CONNECTING: 'bg-amber-100 text-amber-700',
  PENDING_QR: 'bg-blue-100 text-blue-700',
  CONNECTED: 'bg-emerald-100 text-emerald-700',
  LOGGED_OUT: 'bg-charcoal-soft/15 text-charcoal',
  ERROR: 'bg-red-100 text-red-700'
}

const LABEL: Record<State, string> = {
  DISCONNECTED: 'Tidak terhubung',
  CONNECTING: 'Menghubungkan...',
  PENDING_QR: 'Menunggu scan QR',
  CONNECTED: 'Terhubung',
  LOGGED_OUT: 'Logout — perlu pairing ulang',
  ERROR: 'Error'
}

export function ConnectPanel() {
  const qc = useQueryClient()
  const { toast } = useToast()

  const { data } = useQuery<Status>({
    queryKey: ['wa-session-status'],
    queryFn: () => adminApi<Status>('/admin/wa-session/status'),
    refetchInterval: 2000
  })

  const connectM = useMutation({
    mutationFn: () => adminApi('/admin/wa-session/connect', { method: 'POST' }),
    onError: (e: Error) => toast({ variant: 'error', title: 'Gagal hubungkan', description: e.message }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['wa-session-status'] })
  })

  const logoutM = useMutation({
    mutationFn: () => adminApi('/admin/wa-session/logout', { method: 'POST' }),
    onSuccess: () => {
      toast({ variant: 'success', title: 'WhatsApp dilepas' })
      qc.invalidateQueries({ queryKey: ['wa-session-status'] })
    },
    onError: (e: Error) => toast({ variant: 'error', title: 'Gagal logout', description: e.message })
  })

  const state: State = data?.state ?? 'DISCONNECTED'
  const showConnect = state === 'DISCONNECTED' || state === 'LOGGED_OUT' || state === 'ERROR'
  const showLogout = state === 'CONNECTED' || state === 'PENDING_QR' || state === 'CONNECTING'
  const meDigits = data?.meId?.split('@')[0]?.split(':')[0] ?? null

  return (
    <div className="space-y-6">
      <PageHeader
        title="WhatsApp Connect"
        description="Hubungkan WhatsApp ke sistem agar notifikasi pesanan & pengingat terkirim otomatis."
      />

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-3">
            <div>
              <CardTitle>Status Koneksi</CardTitle>
              <CardDescription>
                Sesi WhatsApp berjalan di dalam server API. Scan QR sekali — setelah terhubung, sesi tersimpan
                sampai kamu logout (atau perangkat di-unlink dari ponsel).
              </CardDescription>
            </div>
            <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${BADGE[state]}`}>
              {LABEL[state]}
            </span>
          </div>
        </CardHeader>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Left: actions + meta */}
          <div className="space-y-4">
            {state === 'CONNECTED' && meDigits && (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Nomor terhubung</p>
                <p className="mt-1 font-mono text-lg text-emerald-900">+{meDigits}</p>
                <p className="mt-2 text-xs text-emerald-700">
                  Pesan ke pelanggan dan admin akan dikirim dari nomor ini.
                </p>
              </div>
            )}

            {data?.lastError && state === 'ERROR' && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                {data.lastError}
              </div>
            )}

            <div className="flex gap-3">
              {showConnect && (
                <Button onClick={() => connectM.mutate()} disabled={connectM.isPending}>
                  {connectM.isPending ? 'Memulai...' : 'Hubungkan WhatsApp'}
                </Button>
              )}
              {showLogout && (
                <Button
                  variant="secondary"
                  onClick={() => {
                    if (confirm('Putuskan koneksi WhatsApp? Notifikasi tidak akan terkirim sampai dipasangkan ulang.')) {
                      logoutM.mutate()
                    }
                  }}
                  disabled={logoutM.isPending}
                >
                  {logoutM.isPending ? 'Memutus...' : 'Putuskan'}
                </Button>
              )}
            </div>

            <div className="rounded-xl border border-outline-soft/30 bg-cream-100 p-4 text-xs text-charcoal-soft">
              <p className="mb-2 font-semibold uppercase tracking-wide text-charcoal">Cara pairing</p>
              <ol className="list-decimal space-y-1 pl-4">
                <li>Klik <strong>Hubungkan WhatsApp</strong>.</li>
                <li>Buka WhatsApp di ponsel → <strong>Pengaturan</strong> → <strong>Perangkat tertaut</strong>.</li>
                <li>Pilih <strong>Tautkan perangkat</strong>, lalu scan QR di samping.</li>
                <li>Tunggu status berubah jadi <strong>Terhubung</strong>.</li>
              </ol>
            </div>
          </div>

          {/* Right: QR */}
          <div className="flex items-center justify-center">
            {state === 'PENDING_QR' && data?.qrPng ? (
              <div className="rounded-2xl border border-outline-soft/30 bg-white p-4 shadow-sm">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={data.qrPng} alt="WhatsApp QR" className="h-[300px] w-[300px]" />
                <p className="mt-3 text-center text-xs text-charcoal-soft">
                  QR berubah otomatis tiap ~20 detik. Halaman ini polling status tiap 2 detik.
                </p>
              </div>
            ) : (
              <div className="flex h-[340px] w-full max-w-[340px] items-center justify-center rounded-2xl border border-dashed border-outline-soft/40 bg-cream-100 text-center text-sm text-charcoal-soft">
                {state === 'CONNECTED'
                  ? '✓ Sudah terhubung. QR tidak diperlukan.'
                  : state === 'CONNECTING'
                    ? 'Menyiapkan sesi...'
                    : 'Klik "Hubungkan WhatsApp" untuk menampilkan QR.'}
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  )
}
