'use client'

import Link from 'next/link'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { adminApi } from '@/lib/api'
import { formatDate, formatIdr } from '@/lib/format'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { Input, Textarea } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/ui/badge'
import { Spinner } from '@/components/ui/empty'
import { useToast } from '@/components/ui/toast'

type Customer = {
  id: string
  name: string
  phone: string
  email: string | null
  address: string | null
  notes: string | null
  createdAt: string
  children: { id: string; name: string; ageMonth: number | null; gender: string | null }[]
  checkouts: { id: string; code: string; status: string; totalIdr: number; createdAt: string }[]
}

export function CustomerDetail({ id }: { id: string }) {
  const qc = useQueryClient()
  const { toast } = useToast()
  const { data, isLoading } = useQuery({
    queryKey: ['customer', id],
    queryFn: () => adminApi<Customer>(`/admin/customers/${id}`)
  })

  const [form, setForm] = useState({ name: '', phone: '', email: '', address: '', notes: '' })
  useEffect(() => {
    if (data) {
      setForm({
        name: data.name,
        phone: data.phone,
        email: data.email ?? '',
        address: data.address ?? '',
        notes: data.notes ?? ''
      })
    }
  }, [data])

  const m = useMutation({
    mutationFn: () =>
      adminApi(`/admin/customers/${id}`, {
        method: 'PATCH',
        body: { ...form, email: form.email || null, address: form.address || null, notes: form.notes || null }
      }),
    onSuccess: () => {
      toast({ variant: 'success', title: 'Pelanggan diperbarui' })
      qc.invalidateQueries({ queryKey: ['customer', id] })
      qc.invalidateQueries({ queryKey: ['customers'] })
    },
    onError: (e: Error) => toast({ variant: 'error', title: 'Gagal', description: e.message })
  })

  if (isLoading || !data) {
    return (
      <Card className="flex items-center justify-center py-16">
        <Spinner />
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <Link href="/customers" className="inline-flex items-center gap-1 text-xs font-semibold text-charcoal-soft hover:text-gayatri-600">
          <span className="material-symbols-outlined text-[16px]">arrow_back</span>
          Kembali
        </Link>
        <h1 className="mt-2 font-display text-2xl font-medium text-gayatri-600 md:text-3xl">{data.name}</h1>
        <p className="text-xs text-charcoal-soft">Bergabung {formatDate(data.createdAt)}</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Informasi Pelanggan</CardTitle>
          </CardHeader>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="c-name">Nama</Label>
              <Input id="c-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="c-phone">Telepon</Label>
              <Input id="c-phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="c-email">Email</Label>
              <Input id="c-email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="c-address">Alamat</Label>
              <Textarea id="c-address" rows={2} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="c-notes">Catatan Internal</Label>
              <Textarea id="c-notes" rows={3} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <Button size="sm" onClick={() => m.mutate()} disabled={m.isPending}>
              {m.isPending ? 'Menyimpan...' : 'Simpan'}
            </Button>
          </div>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Bayi ({data.children.length})</CardTitle>
          </CardHeader>
          {data.children.length === 0 ? (
            <p className="text-sm text-charcoal-soft">Belum ada data bayi.</p>
          ) : (
            <ul className="space-y-3">
              {data.children.map((ch) => (
                <li key={ch.id} className="rounded-xl bg-cream-100 p-3">
                  <p className="font-semibold text-charcoal">{ch.name}</p>
                  <p className="text-xs text-charcoal-soft">
                    {ch.ageMonth != null ? `${ch.ageMonth} bulan` : '—'} · {ch.gender === 'L' ? 'Laki-laki' : ch.gender === 'P' ? 'Perempuan' : '—'}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Riwayat Pesanan ({data.checkouts.length})</CardTitle>
        </CardHeader>
        {data.checkouts.length === 0 ? (
          <p className="text-sm text-charcoal-soft">Belum ada pesanan.</p>
        ) : (
          <ul className="divide-y divide-outline-soft/20">
            {data.checkouts.map((c) => (
              <li key={c.id} className="flex items-center justify-between gap-3 py-3 text-sm">
                <div>
                  <Link href={`/checkouts/${c.id}`} className="font-mono text-xs font-semibold text-gayatri-600 hover:underline">{c.code}</Link>
                  <p className="text-xs text-charcoal-soft">{formatDate(c.createdAt)}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-charcoal">{formatIdr(c.totalIdr)}</span>
                  <StatusBadge status={c.status} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  )
}
