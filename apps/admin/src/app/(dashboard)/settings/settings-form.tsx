'use client'

import { useEffect, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { adminApi } from '@/lib/api'
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input, Textarea } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/catalog/PageHeader'
import { Spinner } from '@/components/ui/empty'
import { useToast } from '@/components/ui/toast'

const FIELDS: { key: string; label: string; type: 'text' | 'textarea'; placeholder?: string; hint?: string }[] = [
  { key: 'business_name', label: 'Nama Bisnis', type: 'text', placeholder: 'Gayatri Baby Spa' },
  { key: 'wa_number', label: 'Nomor WhatsApp Utama', type: 'text', placeholder: '62812xxxxx', hint: 'Format: 62 + nomor (tanpa 0 di depan)' },
  { key: 'business_phone', label: 'Telepon Bisnis', type: 'text', placeholder: '+62 812-xxxx-xxxx' },
  { key: 'business_email', label: 'Email Bisnis', type: 'text', placeholder: 'hello@gayatri...' },
  { key: 'business_address', label: 'Alamat', type: 'textarea' },
  { key: 'business_hours', label: 'Jam Operasional', type: 'textarea', hint: 'Satu baris per hari, contoh: Senin–Jumat: 09.00–18.00' },
  { key: 'about_title', label: 'Tentang — Judul', type: 'text' },
  { key: 'about_body', label: 'Tentang — Narasi', type: 'textarea' },
  { key: 'footer_tagline', label: 'Tagline Footer', type: 'text' }
]

export function SettingsForm() {
  const qc = useQueryClient()
  const { toast } = useToast()
  const { data, isLoading } = useQuery({
    queryKey: ['settings'],
    queryFn: () => adminApi<Record<string, string>>('/admin/settings')
  })

  const [values, setValues] = useState<Record<string, string>>({})
  useEffect(() => {
    if (data) setValues(data)
  }, [data])

  const m = useMutation({
    mutationFn: () => adminApi('/admin/settings', { method: 'PUT', body: values }),
    onSuccess: () => {
      toast({ variant: 'success', title: 'Pengaturan disimpan' })
      qc.invalidateQueries({ queryKey: ['settings'] })
    },
    onError: (e: Error) => toast({ variant: 'error', title: 'Gagal', description: e.message })
  })

  if (isLoading) {
    return <Card className="flex items-center justify-center py-16"><Spinner /></Card>
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Pengaturan" description="Informasi bisnis yang ditampilkan di website pelanggan." />
      <Card>
        <CardHeader>
          <CardTitle>Identitas & Kontak</CardTitle>
          <CardDescription>Diambil oleh frontend (footer, halaman kontak, halaman tentang).</CardDescription>
        </CardHeader>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {FIELDS.map((f) => (
            <div key={f.key} className={f.type === 'textarea' ? 'md:col-span-2' : ''}>
              <Label htmlFor={f.key}>{f.label}</Label>
              {f.type === 'textarea' ? (
                <Textarea
                  id={f.key}
                  rows={4}
                  value={values[f.key] ?? ''}
                  onChange={(e) => setValues((p) => ({ ...p, [f.key]: e.target.value }))}
                  placeholder={f.placeholder}
                />
              ) : (
                <Input
                  id={f.key}
                  value={values[f.key] ?? ''}
                  onChange={(e) => setValues((p) => ({ ...p, [f.key]: e.target.value }))}
                  placeholder={f.placeholder}
                />
              )}
              {f.hint && <p className="mt-1 text-[11px] text-charcoal-soft">{f.hint}</p>}
            </div>
          ))}
        </div>
        <div className="mt-6 flex justify-end">
          <Button onClick={() => m.mutate()} disabled={m.isPending}>
            {m.isPending ? 'Menyimpan...' : 'Simpan Pengaturan'}
          </Button>
        </div>
      </Card>
    </div>
  )
}
