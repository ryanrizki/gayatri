'use client'

import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { adminApi } from '@/lib/api'
import { formatDate, formatIdr, relativeTime } from '@/lib/format'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { StatusBadge } from '@/components/ui/badge'
import { EmptyState, Spinner } from '@/components/ui/empty'
import { cn } from '@/lib/cn'

type CheckoutRow = {
  id: string
  code: string
  status: string
  totalIdr: number
  scheduledAt: string | null
  createdAt: string
  customer: { name: string; phone: string }
  items: { id: string; type: string; qty: number }[]
  branch: { name: string } | null
  child: { name: string; ageMonth: number | null } | null
}

const TABS = [
  { key: 'NEW', label: 'Baru' },
  { key: 'CONFIRMED', label: 'Dikonfirmasi' },
  { key: 'RESCHEDULED', label: 'Dijadwal Ulang' },
  { key: 'ONGOING', label: 'Berjalan' },
  { key: 'DONE', label: 'Selesai' },
  { key: 'CANCELLED', label: 'Dibatalkan' }
]

export function CheckoutsList({ initialStatus, initialQ }: { initialStatus: string; initialQ: string }) {
  const router = useRouter()
  const sp = useSearchParams()
  const [status, setStatus] = useState(initialStatus)
  const [q, setQ] = useState(initialQ)
  const [qDebounced, setQDebounced] = useState(initialQ)

  function changeStatus(next: string) {
    setStatus(next)
    const p = new URLSearchParams(sp.toString())
    p.set('status', next)
    router.replace(`/checkouts?${p.toString()}`)
  }

  // simple debounce
  function onQChange(v: string) {
    setQ(v)
    clearTimeout((onQChange as any)._t)
    ;(onQChange as any)._t = setTimeout(() => setQDebounced(v), 300)
  }

  const { data, isLoading } = useQuery({
    queryKey: ['checkouts', status, qDebounced],
    queryFn: () =>
      adminApi<CheckoutRow[]>('/admin/checkouts', {
        query: { status, q: qDebounced || undefined, limit: 50 }
      }),
    refetchInterval: status === 'NEW' ? 30_000 : false
  })

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap gap-1.5 rounded-full bg-white p-1.5 shadow-glow">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => changeStatus(t.key)}
              className={cn(
                'rounded-full px-4 py-1.5 text-xs font-semibold transition-colors',
                status === t.key
                  ? 'bg-gayatri-600 text-white'
                  : 'text-charcoal-soft hover:bg-cream-200 hover:text-charcoal'
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className="relative w-full md:w-72">
          <span className="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-charcoal-soft">
            search
          </span>
          <Input value={q} onChange={(e) => onQChange(e.target.value)} placeholder="Cari kode, nama, atau telepon" className="pl-10" />
        </div>
      </div>

      {isLoading && (
        <Card className="flex items-center justify-center py-16">
          <Spinner />
        </Card>
      )}

      {!isLoading && (!data || data.length === 0) && (
        <EmptyState
          icon="receipt_long"
          title="Belum ada pesanan"
          description="Pesanan dengan status tersebut belum muncul di sini."
        />
      )}

      {!isLoading && data && data.length > 0 && (
        <Card className="overflow-hidden p-0">
          <div className="hidden md:block">
            <table className="w-full text-sm">
              <thead className="bg-cream-100 text-left text-xs uppercase tracking-wider text-charcoal-soft">
                <tr>
                  <th className="px-5 py-3 font-semibold">Kode</th>
                  <th className="px-5 py-3 font-semibold">Pelanggan</th>
                  <th className="px-5 py-3 font-semibold">Item</th>
                  <th className="px-5 py-3 font-semibold">Jadwal</th>
                  <th className="px-5 py-3 font-semibold">Total</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-soft/20">
                {data.map((r) => (
                  <tr key={r.id} className="hover:bg-cream-100">
                    <td className="px-5 py-4">
                      <Link href={`/checkouts/${r.id}`} className="font-mono text-xs font-semibold text-gayatri-600">
                        {r.code}
                      </Link>
                      <p className="mt-0.5 text-[11px] text-charcoal-soft">{relativeTime(r.createdAt)}</p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-semibold text-charcoal">{r.customer.name}</p>
                      <p className="text-xs text-charcoal-soft">{r.customer.phone}</p>
                    </td>
                    <td className="px-5 py-4 text-charcoal-soft">{r.items.length} item</td>
                    <td className="px-5 py-4 text-charcoal-soft">
                      {r.scheduledAt ? formatDate(r.scheduledAt) : '—'}
                    </td>
                    <td className="px-5 py-4 font-semibold text-charcoal">{formatIdr(r.totalIdr)}</td>
                    <td className="px-5 py-4">
                      <StatusBadge status={r.status} />
                    </td>
                    <td className="px-5 py-4 text-right">
                      <Link
                        href={`/checkouts/${r.id}`}
                        className="text-xs font-semibold text-gayatri-600 hover:underline"
                      >
                        Buka
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* mobile cards */}
          <div className="divide-y divide-outline-soft/20 md:hidden">
            {data.map((r) => (
              <Link key={r.id} href={`/checkouts/${r.id}`} className="block p-4 hover:bg-cream-100">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-mono text-xs font-semibold text-gayatri-600">{r.code}</p>
                    <p className="mt-1 font-semibold text-charcoal">{r.customer.name}</p>
                    <p className="text-xs text-charcoal-soft">{r.customer.phone}</p>
                  </div>
                  <StatusBadge status={r.status} />
                </div>
                <div className="mt-3 flex items-center justify-between text-xs">
                  <span className="text-charcoal-soft">{r.items.length} item</span>
                  <span className="font-semibold text-charcoal">{formatIdr(r.totalIdr)}</span>
                </div>
              </Link>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}
