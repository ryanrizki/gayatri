'use client'

import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { adminApi } from '@/lib/api'
import { slugify } from '@/lib/slug'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { PageHeader } from '@/components/catalog/PageHeader'
import { EmptyState, Spinner } from '@/components/ui/empty'
import { useToast } from '@/components/ui/toast'

type Category = { id: string; slug: string; name: string; order: number }

export function CategoriesManager() {
  const qc = useQueryClient()
  const { toast } = useToast()
  const { data, isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: () => adminApi<Category[]>('/admin/categories')
  })

  const del = useMutation({
    mutationFn: (id: string) => adminApi(`/admin/categories/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      toast({ variant: 'success', title: 'Kategori dihapus' })
      qc.invalidateQueries({ queryKey: ['categories'] })
    },
    onError: (e: Error) => toast({ variant: 'error', title: 'Gagal hapus', description: e.message })
  })

  return (
    <div className="space-y-6">
      <PageHeader
        title="Kategori"
        description="Kelompokkan produk untuk navigasi yang lebih rapi."
        action={<CategoryFormDialog mode="create" />}
      />

      {isLoading && (
        <Card className="flex items-center justify-center py-16">
          <Spinner />
        </Card>
      )}

      {!isLoading && data && data.length === 0 && <EmptyState icon="category" title="Belum ada kategori" />}

      {!isLoading && data && data.length > 0 && (
        <Card className="overflow-hidden p-0">
          <table className="w-full text-sm">
            <thead className="bg-cream-100 text-left text-[11px] uppercase tracking-wider text-charcoal-soft">
              <tr>
                <th className="px-5 py-3 font-semibold">Urutan</th>
                <th className="px-5 py-3 font-semibold">Nama</th>
                <th className="px-5 py-3 font-semibold">Slug</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-soft/20">
              {data.map((c) => (
                <tr key={c.id} className="hover:bg-cream-100">
                  <td className="px-5 py-3 text-charcoal-soft">{c.order}</td>
                  <td className="px-5 py-3 font-semibold text-charcoal">{c.name}</td>
                  <td className="px-5 py-3 font-mono text-xs text-charcoal-soft">{c.slug}</td>
                  <td className="px-5 py-3 text-right">
                    <div className="flex justify-end gap-1">
                      <CategoryFormDialog mode="edit" initial={c} />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          if (confirm(`Hapus kategori ${c.name}?`)) del.mutate(c.id)
                        }}
                      >
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                      </Button>
                    </div>
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

function CategoryFormDialog({ mode, initial }: { mode: 'create' | 'edit'; initial?: Category }) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState(initial?.name ?? '')
  const [slug, setSlug] = useState(initial?.slug ?? '')
  const [order, setOrder] = useState(initial?.order ?? 0)
  const qc = useQueryClient()
  const { toast } = useToast()

  const m = useMutation({
    mutationFn: () => {
      const body = { name, slug, order: Number(order) }
      return mode === 'edit' && initial
        ? adminApi(`/admin/categories/${initial.id}`, { method: 'PATCH', body })
        : adminApi('/admin/categories', { method: 'POST', body })
    },
    onSuccess: () => {
      toast({ variant: 'success', title: mode === 'edit' ? 'Kategori diperbarui' : 'Kategori ditambahkan' })
      qc.invalidateQueries({ queryKey: ['categories'] })
      setOpen(false)
    },
    onError: (e: Error) => toast({ variant: 'error', title: 'Gagal', description: e.message })
  })

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o)
        if (o) {
          setName(initial?.name ?? '')
          setSlug(initial?.slug ?? '')
          setOrder(initial?.order ?? 0)
        }
      }}
    >
      <DialogTrigger asChild>
        {mode === 'edit' ? (
          <Button variant="ghost" size="sm">
            <span className="material-symbols-outlined text-[18px]">edit</span>
          </Button>
        ) : (
          <Button>
            <span className="material-symbols-outlined text-[18px]">add</span>
            Tambah Kategori
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{mode === 'edit' ? 'Edit Kategori' : 'Kategori Baru'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="cat-name">Nama</Label>
            <Input
              id="cat-name"
              value={name}
              onChange={(e) => {
                setName(e.target.value)
                if (!slug || mode === 'create') setSlug(slugify(e.target.value))
              }}
            />
          </div>
          <div>
            <Label htmlFor="cat-slug">Slug</Label>
            <Input id="cat-slug" value={slug} onChange={(e) => setSlug(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="cat-order">Urutan</Label>
            <Input id="cat-order" type="number" value={order} onChange={(e) => setOrder(Number(e.target.value))} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>Batal</Button>
          <Button size="sm" onClick={() => m.mutate()} disabled={!name || !slug || m.isPending}>
            {m.isPending ? 'Menyimpan...' : 'Simpan'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
