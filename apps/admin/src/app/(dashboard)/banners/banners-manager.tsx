'use client'

import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { adminApi } from '@/lib/api'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { PageHeader } from '@/components/catalog/PageHeader'
import { EmptyState, Spinner } from '@/components/ui/empty'
import { useToast } from '@/components/ui/toast'

type Banner = {
  id: string
  imageUrl: string
  link: string | null
  title: string | null
  order: number
  active: boolean
}

export function BannersManager() {
  const qc = useQueryClient()
  const { toast } = useToast()
  const { data, isLoading } = useQuery({
    queryKey: ['banners'],
    queryFn: () => adminApi<Banner[]>('/admin/banners')
  })

  const del = useMutation({
    mutationFn: (id: string) => adminApi(`/admin/banners/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      toast({ variant: 'success', title: 'Banner dihapus' })
      qc.invalidateQueries({ queryKey: ['banners'] })
    },
    onError: (e: Error) => toast({ variant: 'error', title: 'Gagal', description: e.message })
  })

  return (
    <div className="space-y-6">
      <PageHeader
        title="Banner"
        description="Banner hero yang tampil di halaman utama."
        action={<BannerFormDialog mode="create" />}
      />

      {isLoading && (
        <Card className="flex items-center justify-center py-16">
          <Spinner />
        </Card>
      )}

      {!isLoading && data && data.length === 0 && <EmptyState icon="image" title="Belum ada banner" />}

      {!isLoading && data && data.length > 0 && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {data.map((b) => (
            <Card key={b.id} className="overflow-hidden p-0">
              <div className="h-40 overflow-hidden bg-gayatri-50">
                {b.imageUrl ? (
                  <img src={b.imageUrl} alt={b.title ?? ''} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center text-gayatri-300">
                    <span className="material-symbols-outlined text-5xl">image</span>
                  </div>
                )}
              </div>
              <div className="p-5">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <h3 className="font-semibold text-charcoal">{b.title ?? 'Tanpa judul'}</h3>
                  <Badge tone={b.active ? 'green' : 'neutral'}>{b.active ? 'Aktif' : 'Nonaktif'}</Badge>
                </div>
                {b.link && <p className="mb-3 truncate text-xs text-charcoal-soft">→ {b.link}</p>}
                <p className="mb-4 text-xs text-charcoal-soft">Urutan: {b.order}</p>
                <div className="flex gap-2">
                  <BannerFormDialog mode="edit" initial={b} />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      if (confirm('Hapus banner ini?')) del.mutate(b.id)
                    }}
                  >
                    <span className="material-symbols-outlined text-[18px]">delete</span>
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

function BannerFormDialog({ mode, initial }: { mode: 'create' | 'edit'; initial?: Banner }) {
  const [open, setOpen] = useState(false)
  const [imageUrl, setImageUrl] = useState(initial?.imageUrl ?? '')
  const [title, setTitle] = useState(initial?.title ?? '')
  const [link, setLink] = useState(initial?.link ?? '')
  const [order, setOrder] = useState(initial?.order ?? 0)
  const [active, setActive] = useState(initial?.active ?? true)
  const qc = useQueryClient()
  const { toast } = useToast()

  const m = useMutation({
    mutationFn: () => {
      const body = {
        imageUrl,
        title: title || null,
        link: link || null,
        order: Number(order),
        active
      }
      return mode === 'edit' && initial
        ? adminApi(`/admin/banners/${initial.id}`, { method: 'PATCH', body })
        : adminApi('/admin/banners', { method: 'POST', body })
    },
    onSuccess: () => {
      toast({ variant: 'success', title: mode === 'edit' ? 'Banner diperbarui' : 'Banner ditambahkan' })
      qc.invalidateQueries({ queryKey: ['banners'] })
      setOpen(false)
    },
    onError: (e: Error) => toast({ variant: 'error', title: 'Gagal', description: e.message })
  })

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o)
        if (o && initial) {
          setImageUrl(initial.imageUrl)
          setTitle(initial.title ?? '')
          setLink(initial.link ?? '')
          setOrder(initial.order)
          setActive(initial.active)
        } else if (o) {
          setImageUrl('')
          setTitle('')
          setLink('')
          setOrder(0)
          setActive(true)
        }
      }}
    >
      <DialogTrigger asChild>
        {mode === 'edit' ? (
          <Button variant="secondary" size="sm" className="flex-1">
            <span className="material-symbols-outlined text-[18px]">edit</span>
            Edit
          </Button>
        ) : (
          <Button>
            <span className="material-symbols-outlined text-[18px]">add</span>
            Tambah Banner
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{mode === 'edit' ? 'Edit Banner' : 'Banner Baru'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="b-image">URL Gambar</Label>
            <Input id="b-image" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://..." />
          </div>
          <div>
            <Label htmlFor="b-title">Judul (opsional)</Label>
            <Input id="b-title" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="b-link">Link Tujuan (opsional)</Label>
            <Input id="b-link" value={link} onChange={(e) => setLink(e.target.value)} placeholder="/services/..." />
          </div>
          <div>
            <Label htmlFor="b-order">Urutan</Label>
            <Input id="b-order" type="number" value={order} onChange={(e) => setOrder(Number(e.target.value))} />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} className="h-4 w-4 rounded accent-gayatri-600" />
            <span>Aktif</span>
          </label>
        </div>
        <DialogFooter>
          <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>Batal</Button>
          <Button size="sm" onClick={() => m.mutate()} disabled={!imageUrl || m.isPending}>
            {m.isPending ? 'Menyimpan...' : 'Simpan'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
