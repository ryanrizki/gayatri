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

type ServiceRow = {
  id: string
  slug: string
  name: string
  priceIdr: number
  durationMin: number
  ageMinMonth: number
  ageMaxMonth: number
  active: boolean
  imageUrl: string | null
}

export function ServicesList() {
  const qc = useQueryClient()
  const { toast } = useToast()
  const { data, isLoading } = useQuery({
    queryKey: ['services'],
    queryFn: () => adminApi<ServiceRow[]>('/admin/services')
  })

  const del = useMutation({
    mutationFn: (id: string) => adminApi(`/admin/services/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      toast({ variant: 'success', title: 'Layanan dinonaktifkan' })
      qc.invalidateQueries({ queryKey: ['services'] })
    },
    onError: (e: Error) => toast({ variant: 'error', title: 'Gagal', description: e.message })
  })

  return (
    <div className="space-y-6">
      <PageHeader
        title="Layanan"
        description="Kelola katalog layanan spa yang ditampilkan di website."
        action={
          <Button asChild>
            <Link href="/services/new">
              <span className="material-symbols-outlined text-[18px]">add</span>
              Tambah Layanan
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
          icon="spa"
          title="Belum ada layanan"
          description="Tambahkan layanan pertama untuk ditampilkan di website."
          action={
            <Button asChild>
              <Link href="/services/new">Tambah Layanan</Link>
            </Button>
          }
        />
      )}

      {!isLoading && data && data.length > 0 && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {data.map((s) => (
            <Card key={s.id} className="flex flex-col">
              <div className="-mx-6 -mt-6 mb-4 h-40 overflow-hidden rounded-t-2xl bg-gayatri-50">
                {s.imageUrl ? (
                  <img src={s.imageUrl} alt={s.name} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center text-gayatri-300">
                    <span className="material-symbols-outlined text-5xl">spa</span>
                  </div>
                )}
              </div>
              <div className="mb-3 flex items-start justify-between gap-2">
                <h3 className="font-semibold text-charcoal">{s.name}</h3>
                <Badge tone={s.active ? 'green' : 'neutral'}>{s.active ? 'Aktif' : 'Nonaktif'}</Badge>
              </div>
              <p className="mb-4 text-xs text-charcoal-soft">/{s.slug}</p>
              <div className="mb-5 grid grid-cols-3 gap-2 text-center text-xs">
                <Stat label="Harga" value={formatIdr(s.priceIdr)} />
                <Stat label="Durasi" value={`${s.durationMin}m`} />
                <Stat label="Usia" value={`${s.ageMinMonth}-${s.ageMaxMonth}b`} />
              </div>
              <div className="mt-auto flex gap-2">
                <Button asChild variant="secondary" size="sm" className="flex-1">
                  <Link href={`/services/${s.id}`}>
                    <span className="material-symbols-outlined text-[18px]">edit</span>
                    Edit
                  </Link>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    if (confirm(`Nonaktifkan ${s.name}?`)) del.mutate(s.id)
                  }}
                  disabled={del.isPending || !s.active}
                >
                  <span className="material-symbols-outlined text-[18px]">archive</span>
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-cream-100 px-2 py-1.5">
      <p className="text-[10px] uppercase tracking-wider text-charcoal-soft">{label}</p>
      <p className="text-xs font-semibold text-charcoal">{value}</p>
    </div>
  )
}
