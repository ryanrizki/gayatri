'use client'

import { useEffect, useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { adminApi, ApiError } from '@/lib/api'
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input, Textarea } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/catalog/PageHeader'
import { Spinner } from '@/components/ui/empty'
import { useToast } from '@/components/ui/toast'

// Per-field validator. Returns error message or null. Empty string means "not provided".
type Rule = { required?: boolean; validate?: (v: string) => string | null; maxLen?: number }

// WA admin number must be intl format Fonnte/Baileys can dial: 62 + 8-14 digits.
const WA_RE = /^62[0-9]{8,14}$/
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const FIELDS: {
  key: string
  label: string
  type: 'text' | 'textarea'
  placeholder?: string
  hint?: string
  rule?: Rule
}[] = [
  {
    key: 'business_name',
    label: 'Nama Bisnis',
    type: 'text',
    placeholder: 'Gayatri Baby Spa',
    rule: { required: true, maxLen: 200, validate: (v) => (v.trim().length < 2 ? 'Minimal 2 karakter.' : null) }
  },
  {
    key: 'admin_wa_number',
    label: 'Nomor WhatsApp Admin (untuk notifikasi)',
    type: 'text',
    placeholder: '6282132091173',
    hint: 'Format internasional: 62 + nomor (tanpa 0 atau +). Nomor ini menerima notifikasi setiap pesanan baru.',
    rule: {
      required: true,
      maxLen: 20,
      validate: (v) => (WA_RE.test(v) ? null : 'Format salah. Contoh benar: 6282132091173 (62 + 10–14 angka).')
    }
  },
  {
    key: 'business_phone',
    label: 'Telepon Bisnis (tampilan)',
    type: 'text',
    placeholder: '+62 812-3456-7890',
    hint: 'Hanya untuk ditampilkan di website. Bebas format.',
    rule: { maxLen: 50 }
  },
  {
    key: 'business_email',
    label: 'Email Bisnis',
    type: 'text',
    placeholder: 'hello@gayatri.id',
    rule: {
      maxLen: 200,
      validate: (v) => (v.trim() === '' || EMAIL_RE.test(v.trim()) ? null : 'Format email tidak valid.')
    }
  },
  { key: 'business_address', label: 'Alamat', type: 'textarea', rule: { maxLen: 500 } },
  {
    key: 'business_hours',
    label: 'Jam Operasional',
    type: 'textarea',
    hint: 'Satu baris per hari, contoh: Senin–Jumat: 09.00–18.00',
    rule: { maxLen: 1000 }
  },
  { key: 'about_title', label: 'Tentang — Judul', type: 'text', rule: { maxLen: 200 } },
  { key: 'about_body', label: 'Tentang — Narasi', type: 'textarea', rule: { maxLen: 4000 } },
  { key: 'footer_tagline', label: 'Tagline Footer', type: 'text', rule: { maxLen: 200 } }
]

function fieldError(v: string, rule?: Rule): string | null {
  if (!rule) return null
  if (rule.required && v.trim() === '') return 'Wajib diisi.'
  if (rule.maxLen && v.length > rule.maxLen) return `Maksimal ${rule.maxLen} karakter (saat ini ${v.length}).`
  if (rule.validate) return rule.validate(v)
  return null
}

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

  // Inline errors keyed by field.
  const errors = useMemo(() => {
    const out: Record<string, string | null> = {}
    for (const f of FIELDS) out[f.key] = fieldError(values[f.key] ?? '', f.rule)
    return out
  }, [values])
  const hasErrors = Object.values(errors).some((e) => e)

  // Dirty = at least one field differs from server. Compares known keys only.
  const isDirty = useMemo(() => {
    if (!data) return false
    return FIELDS.some((f) => (values[f.key] ?? '') !== (data[f.key] ?? ''))
  }, [values, data])

  const m = useMutation({
    // Only send keys this UI knows about. The API echoes all DB rows on GET
    // (incl. orphans like reminder_*), and PUT zod-rejects unknown keys.
    mutationFn: () => {
      const body: Record<string, string> = {}
      for (const f of FIELDS) body[f.key] = values[f.key] ?? ''
      return adminApi('/admin/settings', { method: 'PUT', body })
    },
    onSuccess: () => {
      toast({ variant: 'success', title: 'Pengaturan disimpan' })
      qc.invalidateQueries({ queryKey: ['settings'] })
    },
    onError: (e: Error) => {
      // Surface zod issues from the API if available, not just "Validation failed".
      let description = e.message
      if (e instanceof ApiError && e.data && typeof e.data === 'object') {
        const issues = (e.data as { issues?: { path?: unknown[]; message?: string }[] }).issues
        if (Array.isArray(issues) && issues.length > 0) {
          description = issues
            .slice(0, 3)
            .map((i) => `${(i.path ?? []).join('.') || 'field'}: ${i.message ?? 'invalid'}`)
            .join(' • ')
        }
      }
      toast({ variant: 'error', title: 'Gagal menyimpan', description })
    }
  })

  if (isLoading) {
    return (
      <Card className="flex items-center justify-center py-16">
        <Spinner />
      </Card>
    )
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
          {FIELDS.map((f) => {
            const v = values[f.key] ?? ''
            const err = errors[f.key]
            const showErr = err && v !== ''
            return (
              <div key={f.key} className={f.type === 'textarea' ? 'md:col-span-2' : ''}>
                <Label htmlFor={f.key}>
                  {f.label}
                  {f.rule?.required && <span className="ml-1 text-red-600">*</span>}
                </Label>
                {f.type === 'textarea' ? (
                  <Textarea
                    id={f.key}
                    rows={4}
                    value={v}
                    onChange={(e) => setValues((p) => ({ ...p, [f.key]: e.target.value }))}
                    placeholder={f.placeholder}
                    aria-invalid={!!showErr}
                  />
                ) : (
                  <Input
                    id={f.key}
                    value={v}
                    onChange={(e) => setValues((p) => ({ ...p, [f.key]: e.target.value }))}
                    placeholder={f.placeholder}
                    aria-invalid={!!showErr}
                  />
                )}
                {showErr ? (
                  <p className="mt-1 text-[11px] text-red-600">{err}</p>
                ) : f.hint ? (
                  <p className="mt-1 text-[11px] text-charcoal-soft">{f.hint}</p>
                ) : null}
              </div>
            )
          })}
        </div>
        <div className="mt-6 flex items-center justify-end gap-3">
          {hasErrors && <span className="text-xs text-red-600">Perbaiki kolom yang ditandai sebelum menyimpan.</span>}
          {!hasErrors && isDirty && <span className="text-xs text-amber-600">Ada perubahan belum disimpan.</span>}
          <Button onClick={() => m.mutate()} disabled={m.isPending || !isDirty || hasErrors}>
            {m.isPending ? 'Menyimpan...' : 'Simpan Pengaturan'}
          </Button>
        </div>
      </Card>
    </div>
  )
}
