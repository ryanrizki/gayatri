'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { adminApi } from '@/lib/api'
import { slugify } from '@/lib/slug'
import { Card } from '@/components/ui/card'
import { FormSection } from '@/components/catalog/FormSection'
import { Input, Textarea } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/toast'

const Schema = z.object({
  slug: z.string().min(1).max(80).regex(/^[a-z0-9-]+$/, 'huruf kecil/angka/-'),
  name: z.string().min(2).max(120),
  description: z.string().min(10).max(2000),
  priceIdr: z.coerce.number().int().min(0),
  durationMin: z.coerce.number().int().min(5).max(480),
  ageMinMonth: z.coerce.number().int().min(0).max(120),
  ageMaxMonth: z.coerce.number().int().min(0).max(120),
  imageUrl: z.string().url().or(z.literal('')).optional(),
  gallery: z.string().optional(),
  active: z.boolean()
})

export type ServiceFormValues = z.infer<typeof Schema>

export function ServiceForm({
  initial,
  id
}: {
  initial?: Omit<Partial<ServiceFormValues>, 'gallery'> & { gallery?: string[] | string }
  id?: string
}) {
  const router = useRouter()
  const qc = useQueryClient()
  const { toast } = useToast()

  const form = useForm<ServiceFormValues>({
    resolver: zodResolver(Schema),
    defaultValues: {
      slug: initial?.slug ?? '',
      name: initial?.name ?? '',
      description: initial?.description ?? '',
      priceIdr: initial?.priceIdr ?? 0,
      durationMin: initial?.durationMin ?? 60,
      ageMinMonth: initial?.ageMinMonth ?? 1,
      ageMaxMonth: initial?.ageMaxMonth ?? 36,
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
    mutationFn: (v: ServiceFormValues) => {
      const body = {
        ...v,
        imageUrl: v.imageUrl?.trim() || null,
        gallery: (v.gallery ?? '')
          .split('\n')
          .map((s) => s.trim())
          .filter(Boolean)
      }
      return id
        ? adminApi(`/admin/services/${id}`, { method: 'PATCH', body })
        : adminApi('/admin/services', { method: 'POST', body })
    },
    onSuccess: () => {
      toast({ variant: 'success', title: id ? 'Layanan diperbarui' : 'Layanan ditambahkan' })
      qc.invalidateQueries({ queryKey: ['services'] })
      router.push('/services')
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
      <Card className="p-6 md:p-8">
        <FormSection title="Informasi Dasar" description="Beri judul yang menarik dan deskripsi mendalam mengenai layanan ini.">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="name">Nama Layanan</Label>
              <Input id="name" {...form.register('name')} onBlur={autoSlug} />
              {form.formState.errors.name && <p className="mt-1 text-xs text-red-600">{form.formState.errors.name.message}</p>}
            </div>
            <div>
              <Label htmlFor="slug">Slug (URL)</Label>
              <Input id="slug" {...form.register('slug')} placeholder="baby-spa-massage" />
              {form.formState.errors.slug && <p className="mt-1 text-xs text-red-600">{form.formState.errors.slug.message}</p>}
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="description">Deskripsi</Label>
              <Textarea id="description" rows={5} {...form.register('description')} />
              {form.formState.errors.description && <p className="mt-1 text-xs text-red-600">{form.formState.errors.description.message}</p>}
            </div>
          </div>
        </FormSection>

        <FormSection title="Konfigurasi & Harga" description="Tentukan durasi, rentang usia, serta biaya layanan.">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <div>
              <Label htmlFor="priceIdr">Harga (Rp)</Label>
              <Input id="priceIdr" type="number" min="0" {...form.register('priceIdr')} />
            </div>
            <div>
              <Label htmlFor="durationMin">Durasi (menit)</Label>
              <Input id="durationMin" type="number" min="5" {...form.register('durationMin')} />
            </div>
            <div>
              <Label htmlFor="ageMinMonth">Usia Min (bulan)</Label>
              <Input id="ageMinMonth" type="number" min="0" {...form.register('ageMinMonth')} />
            </div>
            <div>
              <Label htmlFor="ageMaxMonth">Usia Max (bulan)</Label>
              <Input id="ageMaxMonth" type="number" min="0" {...form.register('ageMaxMonth')} />
            </div>
          </div>
        </FormSection>

        <FormSection title="Media Layanan" description="Unggah gambar berkualitas tinggi untuk katalog di aplikasi pelanggan.">
          <div className="space-y-4">
            <div>
              <Label htmlFor="imageUrl">URL Gambar Utama</Label>
              <Input id="imageUrl" {...form.register('imageUrl')} placeholder="https://..." />
              {form.formState.errors.imageUrl && <p className="mt-1 text-xs text-red-600">{form.formState.errors.imageUrl.message}</p>}
            </div>
            <div>
              <Label htmlFor="gallery">Galeri (satu URL per baris)</Label>
              <Textarea id="gallery" rows={4} {...form.register('gallery')} placeholder="https://...&#10;https://..." />
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" {...form.register('active')} className="h-4 w-4 rounded border-outline-soft accent-gayatri-600" />
              <span>Aktif (tampil di website)</span>
            </label>
          </div>
        </FormSection>
      </Card>

      <div className="flex justify-end gap-2">
        <Button asChild variant="ghost">
          <Link href="/services">Batal</Link>
        </Button>
        <Button type="submit" disabled={m.isPending}>
          {m.isPending ? 'Menyimpan...' : 'Simpan Layanan'}
        </Button>
      </div>
    </form>
  )
}
