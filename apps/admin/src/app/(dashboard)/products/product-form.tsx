'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { adminApi } from '@/lib/api'
import { slugify } from '@/lib/slug'
import { Card } from '@/components/ui/card'
import { Input, Textarea } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/toast'

const Schema = z.object({
  slug: z.string().min(1).max(80).regex(/^[a-z0-9-]+$/),
  name: z.string().min(2).max(120),
  description: z.string().min(10).max(2000),
  priceIdr: z.coerce.number().int().min(0),
  stock: z.coerce.number().int().min(0),
  stockThreshold: z.coerce.number().int().min(0),
  categoryId: z.string().min(1, 'Kategori wajib'),
  imageUrl: z.string().url().or(z.literal('')).optional(),
  gallery: z.string().optional(),
  active: z.boolean()
})
type FormValues = z.infer<typeof Schema>

export function ProductForm({
  initial,
  id
}: {
  initial?: Omit<Partial<FormValues>, 'gallery'> & { gallery?: string[] | string }
  id?: string
}) {
  const router = useRouter()
  const qc = useQueryClient()
  const { toast } = useToast()

  const cats = useQuery({
    queryKey: ['categories'],
    queryFn: () => adminApi<{ id: string; name: string; slug: string }[]>('/admin/categories')
  })

  const form = useForm<FormValues>({
    resolver: zodResolver(Schema),
    defaultValues: {
      slug: initial?.slug ?? '',
      name: initial?.name ?? '',
      description: initial?.description ?? '',
      priceIdr: initial?.priceIdr ?? 0,
      stock: initial?.stock ?? 0,
      stockThreshold: initial?.stockThreshold ?? 5,
      categoryId: initial?.categoryId ?? '',
      imageUrl: initial?.imageUrl ?? '',
      gallery: Array.isArray(initial?.gallery)
        ? initial!.gallery.join('\n')
        : typeof initial?.gallery === 'string'
          ? initial.gallery
          : '',
      active: initial?.active ?? true
    }
  })

  const m = useMutation({
    mutationFn: (v: FormValues) => {
      const body = {
        ...v,
        imageUrl: v.imageUrl?.trim() || null,
        gallery: (v.gallery ?? '').split('\n').map((s) => s.trim()).filter(Boolean)
      }
      return id
        ? adminApi(`/admin/products/${id}`, { method: 'PATCH', body })
        : adminApi('/admin/products', { method: 'POST', body })
    },
    onSuccess: () => {
      toast({ variant: 'success', title: id ? 'Produk diperbarui' : 'Produk ditambahkan' })
      qc.invalidateQueries({ queryKey: ['products'] })
      router.push('/products')
    },
    onError: (e: Error) => toast({ variant: 'error', title: 'Gagal simpan', description: e.message })
  })

  function autoSlug() {
    const cur = form.getValues('slug')
    const name = form.getValues('name')
    if (!cur && name) form.setValue('slug', slugify(name))
  }

  return (
    <form onSubmit={form.handleSubmit((v) => m.mutate(v))} className="space-y-6">
      <Card>
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-charcoal-soft">Informasi Dasar</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <Label htmlFor="name">Nama Produk</Label>
            <Input id="name" {...form.register('name')} onBlur={autoSlug} />
            {form.formState.errors.name && <p className="mt-1 text-xs text-red-600">{form.formState.errors.name.message}</p>}
          </div>
          <div>
            <Label htmlFor="slug">Slug (URL)</Label>
            <Input id="slug" {...form.register('slug')} />
            {form.formState.errors.slug && <p className="mt-1 text-xs text-red-600">{form.formState.errors.slug.message}</p>}
          </div>
          <div className="md:col-span-2">
            <Label htmlFor="categoryId">Kategori</Label>
            <select
              id="categoryId"
              {...form.register('categoryId')}
              className="w-full rounded-xl border border-outline-soft/40 bg-white px-4 py-2.5 text-sm focus:border-gayatri-600 focus:outline-none focus:ring-2 focus:ring-gayatri-600/20"
            >
              <option value="">— Pilih kategori —</option>
              {cats.data?.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            {form.formState.errors.categoryId && <p className="mt-1 text-xs text-red-600">{form.formState.errors.categoryId.message}</p>}
          </div>
          <div className="md:col-span-2">
            <Label htmlFor="description">Deskripsi</Label>
            <Textarea id="description" rows={5} {...form.register('description')} />
            {form.formState.errors.description && <p className="mt-1 text-xs text-red-600">{form.formState.errors.description.message}</p>}
          </div>
        </div>
      </Card>

      <Card>
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-charcoal-soft">Harga & Stok</h2>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          <div>
            <Label htmlFor="priceIdr">Harga (Rp)</Label>
            <Input id="priceIdr" type="number" min="0" {...form.register('priceIdr')} />
          </div>
          <div>
            <Label htmlFor="stock">Stok</Label>
            <Input id="stock" type="number" min="0" {...form.register('stock')} />
          </div>
          <div>
            <Label htmlFor="stockThreshold">Ambang Stok Menipis</Label>
            <Input id="stockThreshold" type="number" min="0" {...form.register('stockThreshold')} />
          </div>
        </div>
      </Card>

      <Card>
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-charcoal-soft">Media</h2>
        <div className="space-y-4">
          <div>
            <Label htmlFor="imageUrl">URL Gambar Utama</Label>
            <Input id="imageUrl" {...form.register('imageUrl')} placeholder="https://..." />
            {form.formState.errors.imageUrl && <p className="mt-1 text-xs text-red-600">{form.formState.errors.imageUrl.message}</p>}
          </div>
          <div>
            <Label htmlFor="gallery">Galeri (satu URL per baris)</Label>
            <Textarea id="gallery" rows={4} {...form.register('gallery')} />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" {...form.register('active')} className="h-4 w-4 rounded border-outline-soft accent-gayatri-600" />
            <span>Aktif</span>
          </label>
        </div>
      </Card>

      <div className="flex justify-end gap-2">
        <Button asChild variant="ghost">
          <Link href="/products">Batal</Link>
        </Button>
        <Button type="submit" disabled={m.isPending}>
          {m.isPending ? 'Menyimpan...' : 'Simpan'}
        </Button>
      </div>
    </form>
  )
}
