'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import Link from 'next/link'
import { adminApi } from '@/lib/api'
import { formatIdr } from '@/lib/format'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { PageHeader } from '@/components/catalog/PageHeader'
import { EmptyState, Spinner } from '@/components/ui/empty'
import { useToast } from '@/components/ui/toast'

type ProductRow = {
  id: string
  slug: string
  name: string
  priceIdr: number
  stock: number
  stockThreshold: number
  active: boolean
  imageUrl: string | null
  category: { id: string; name: string } | null
}

export function ProductsList() {
  const qc = useQueryClient()
  const { toast } = useToast()
  const { data, isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: () => adminApi<ProductRow[]>('/admin/products')
  })

  const del = useMutation({
    mutationFn: (id: string) => adminApi(`/admin/products/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      toast({ variant: 'success', title: 'Produk dinonaktifkan' })
      qc.invalidateQueries({ queryKey: ['products'] })
    },
    onError: (e: Error) => toast({ variant: 'error', title: 'Gagal', description: e.message })
  })

  return (
    <div className="space-y-6">
      <PageHeader
        title="Produk"
        description="Kelola katalog produk yang dijual via WhatsApp."
        action={
          <Button asChild>
            <Link href="/products/new">
              <span className="material-symbols-outlined text-[18px]">add</span>
              Tambah Produk
            </Link>
          </Button>
        }
      />

      {isLoading && (
        <Card className="flex items-center justify-center py-16">
          <Spinner />
        </Card>
      )}

      {!isLoading && data && data.length === 0 && (
        <EmptyState
          icon="inventory_2"
          title="Belum ada produk"
          action={
            <Button asChild>
              <Link href="/products/new">Tambah Produk</Link>
            </Button>
          }
        />
      )}

      {!isLoading && data && data.length > 0 && (
        <Card className="overflow-hidden p-0">
          <table className="w-full text-sm">
            <thead className="bg-cream-100 text-left text-[11px] uppercase tracking-wider text-charcoal-soft">
              <tr>
                <th className="px-5 py-3 font-semibold">Produk</th>
                <th className="px-5 py-3 font-semibold">Kategori</th>
                <th className="px-5 py-3 font-semibold">Harga</th>
                <th className="px-5 py-3 font-semibold">Stok</th>
                <th className="px-5 py-3 font-semibold">Status</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-soft/20">
              {data.map((p) => {
                const low = p.stock <= p.stockThreshold
                return (
                  <tr key={p.id} className="hover:bg-cream-100">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-gayatri-50">
                          {p.imageUrl ? (
                            <img src={p.imageUrl} alt={p.name} className="h-full w-full object-cover" />
                          ) : (
                            <div className="flex h-full items-center justify-center text-gayatri-300">
                              <span className="material-symbols-outlined text-[20px]">inventory_2</span>
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-charcoal">{p.name}</p>
                          <p className="text-[11px] text-charcoal-soft">/{p.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-charcoal-soft">{p.category?.name ?? '—'}</td>
                    <td className="px-5 py-3 font-semibold text-charcoal">{formatIdr(p.priceIdr)}</td>
                    <td className="px-5 py-3">
                      <Badge tone={p.stock === 0 ? 'red' : low ? 'amber' : 'green'}>
                        {p.stock} {p.stock === 0 ? '(habis)' : low ? '(menipis)' : ''}
                      </Badge>
                    </td>
                    <td className="px-5 py-3">
                      <Badge tone={p.active ? 'green' : 'neutral'}>{p.active ? 'Aktif' : 'Nonaktif'}</Badge>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <div className="flex justify-end gap-1">
                        <Button asChild variant="ghost" size="sm">
                          <Link href={`/products/${p.id}`}>
                            <span className="material-symbols-outlined text-[18px]">edit</span>
                          </Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            if (confirm(`Nonaktifkan ${p.name}?`)) del.mutate(p.id)
                          }}
                          disabled={!p.active || del.isPending}
                        >
                          <span className="material-symbols-outlined text-[18px]">archive</span>
                        </Button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  )
}
