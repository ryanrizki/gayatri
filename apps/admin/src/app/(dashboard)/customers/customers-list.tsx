'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { adminApi } from '@/lib/api'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { PageHeader } from '@/components/catalog/PageHeader'
import { EmptyState, Spinner } from '@/components/ui/empty'

type CustomerRow = {
  id: string
  name: string
  phone: string
  email: string | null
  createdAt: string
  _count: { checkouts: number; children: number }
}

export function CustomersList({ initialQ }: { initialQ: string }) {
  const [q, setQ] = useState(initialQ)
  const [qDebounced, setQDebounced] = useState(initialQ)

  function onQChange(v: string) {
    setQ(v)
    clearTimeout((onQChange as any)._t)
    ;(onQChange as any)._t = setTimeout(() => setQDebounced(v), 300)
  }

  const { data, isLoading } = useQuery({
    queryKey: ['customers', qDebounced],
    queryFn: () => adminApi<CustomerRow[]>('/admin/customers', { query: { q: qDebounced || undefined, limit: 100 } })
  })

  return (
    <div className="space-y-6">
      <PageHeader title="Pelanggan" description="Daftar pelanggan yang pernah melakukan pemesanan." />
      <div className="relative w-full md:w-72">
        <span className="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-charcoal-soft">search</span>
        <Input value={q} onChange={(e) => onQChange(e.target.value)} placeholder="Cari nama atau telepon" className="pl-10" />
      </div>
      {isLoading && (
        <Card className="flex items-center justify-center py-16">
          <Spinner />
        </Card>
      )}
      {!isLoading && data && data.length === 0 && <EmptyState icon="contacts" title="Tidak ada pelanggan" />}
      {!isLoading && data && data.length > 0 && (
        <Card className="overflow-hidden p-0">
          <table className="w-full text-sm">
            <thead className="bg-cream-100 text-left text-[11px] uppercase tracking-wider text-charcoal-soft">
              <tr>
                <th className="px-5 py-3 font-semibold">Nama</th>
                <th className="px-5 py-3 font-semibold">Telepon</th>
                <th className="px-5 py-3 font-semibold">Email</th>
                <th className="px-5 py-3 font-semibold">Pesanan</th>
                <th className="px-5 py-3 font-semibold">Bayi</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-soft/20">
              {data.map((c) => (
                <tr key={c.id} className="hover:bg-cream-100">
                  <td className="px-5 py-3 font-semibold text-charcoal">
                    <Link href={`/customers/${c.id}`} className="hover:text-gayatri-600">{c.name}</Link>
                  </td>
                  <td className="px-5 py-3 text-charcoal-soft">{c.phone}</td>
                  <td className="px-5 py-3 text-charcoal-soft">{c.email ?? '—'}</td>
                  <td className="px-5 py-3 text-charcoal">{c._count.checkouts}</td>
                  <td className="px-5 py-3 text-charcoal-soft">{c._count.children}</td>
                  <td className="px-5 py-3 text-right">
                    <Link href={`/customers/${c.id}`} className="text-xs font-semibold text-gayatri-600 hover:underline">Detail</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  )
}
