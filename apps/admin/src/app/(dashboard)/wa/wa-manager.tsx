'use client'

import { useEffect, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { adminApi } from '@/lib/api'
import { formatDate } from '@/lib/format'
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input, Textarea } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { PageHeader } from '@/components/catalog/PageHeader'
import { Spinner } from '@/components/ui/empty'
import { useToast } from '@/components/ui/toast'
import { cn } from '@/lib/cn'

type Template = { code: string; name: string; body: string; active: boolean }
type WaLog = {
  id: string
  templateCode: string
  status: string
  phone: string
  body: string | null
  error: string | null
  createdAt: string
  checkoutId: string | null
}

export function WaManager() {
  const [tab, setTab] = useState<'templates' | 'logs'>('templates')

  return (
    <div className="space-y-6">
      <PageHeader title="WhatsApp" description="Atur template pesan otomatis dan pantau log pengiriman." />
      <div className="inline-flex gap-1.5 rounded-full bg-white p-1.5 shadow-glow">
        <TabBtn active={tab === 'templates'} onClick={() => setTab('templates')}>Template</TabBtn>
        <TabBtn active={tab === 'logs'} onClick={() => setTab('logs')}>Log Pengiriman</TabBtn>
      </div>
      {tab === 'templates' ? <Templates /> : <Logs />}
    </div>
  )
}

function TabBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'rounded-full px-4 py-1.5 text-xs font-semibold transition-colors',
        active ? 'bg-gayatri-600 text-white' : 'text-charcoal-soft hover:bg-cream-200 hover:text-charcoal'
      )}
    >
      {children}
    </button>
  )
}

function Templates() {
  const { data, isLoading } = useQuery({
    queryKey: ['wa-templates'],
    queryFn: () => adminApi<Template[]>('/admin/wa-templates')
  })

  if (isLoading) return <Card className="flex items-center justify-center py-16"><Spinner /></Card>
  if (!data) return <Card className="text-sm text-red-600">Gagal memuat.</Card>

  return (
    <div className="space-y-4">
      {data.map((t) => (
        <TemplateCard key={t.code} t={t} />
      ))}
    </div>
  )
}

function TemplateCard({ t }: { t: Template }) {
  const qc = useQueryClient()
  const { toast } = useToast()
  const [name, setName] = useState(t.name)
  const [body, setBody] = useState(t.body)
  const [active, setActive] = useState(t.active)

  useEffect(() => {
    setName(t.name); setBody(t.body); setActive(t.active)
  }, [t])

  const m = useMutation({
    mutationFn: () => adminApi(`/admin/wa-templates/${t.code}`, { method: 'PUT', body: { name, body, active } }),
    onSuccess: () => {
      toast({ variant: 'success', title: 'Template diperbarui' })
      qc.invalidateQueries({ queryKey: ['wa-templates'] })
    },
    onError: (e: Error) => toast({ variant: 'error', title: 'Gagal', description: e.message })
  })

  return (
    <Card>
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-wider text-charcoal-soft">{t.code}</p>
          <h3 className="font-semibold text-charcoal">{t.name}</h3>
        </div>
        <Badge tone={active ? 'green' : 'neutral'}>{active ? 'Aktif' : 'Nonaktif'}</Badge>
      </div>
      <div className="space-y-3">
        <div>
          <Label htmlFor={`name-${t.code}`}>Nama</Label>
          <Input id={`name-${t.code}`} value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div>
          <Label htmlFor={`body-${t.code}`}>Isi Pesan</Label>
          <Textarea id={`body-${t.code}`} rows={6} value={body} onChange={(e) => setBody(e.target.value)} />
          <p className="mt-1 text-[11px] text-charcoal-soft">
            Variabel: <code className="rounded bg-cream-200 px-1">{'{{customerName}}'}</code>,{' '}
            <code className="rounded bg-cream-200 px-1">{'{{code}}'}</code>,{' '}
            <code className="rounded bg-cream-200 px-1">{'{{scheduledAt}}'}</code>
          </p>
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} className="h-4 w-4 accent-gayatri-600" />
          Aktif
        </label>
      </div>
      <div className="mt-4 flex justify-end">
        <Button size="sm" onClick={() => m.mutate()} disabled={m.isPending}>
          {m.isPending ? 'Menyimpan...' : 'Simpan'}
        </Button>
      </div>
    </Card>
  )
}

function Logs() {
  const [status, setStatus] = useState<string>('')
  const { data, isLoading } = useQuery({
    queryKey: ['wa-logs', status],
    queryFn: () => adminApi<WaLog[]>('/admin/wa-logs', { query: { status: status || undefined, limit: 100 } }),
    refetchInterval: 60_000
  })

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-1.5 rounded-full bg-white p-1.5 shadow-glow">
        {[
          { v: '', l: 'Semua' },
          { v: 'SENT', l: 'Terkirim' },
          { v: 'FAILED', l: 'Gagal' },
          { v: 'QUEUED', l: 'Antri' }
        ].map((f) => (
          <button
            key={f.v}
            onClick={() => setStatus(f.v)}
            className={cn(
              'rounded-full px-4 py-1.5 text-xs font-semibold transition-colors',
              status === f.v ? 'bg-gayatri-600 text-white' : 'text-charcoal-soft hover:bg-cream-200'
            )}
          >
            {f.l}
          </button>
        ))}
      </div>
      {isLoading ? (
        <Card className="flex items-center justify-center py-16"><Spinner /></Card>
      ) : !data || data.length === 0 ? (
        <Card className="text-sm text-charcoal-soft">Belum ada log.</Card>
      ) : (
        <Card className="overflow-hidden p-0">
          <table className="w-full text-sm">
            <thead className="bg-cream-100 text-left text-[11px] uppercase tracking-wider text-charcoal-soft">
              <tr>
                <th className="px-5 py-3 font-semibold">Waktu</th>
                <th className="px-5 py-3 font-semibold">Template</th>
                <th className="px-5 py-3 font-semibold">Telepon</th>
                <th className="px-5 py-3 font-semibold">Status</th>
                <th className="px-5 py-3 font-semibold">Error</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-soft/20">
              {data.map((l) => (
                <tr key={l.id}>
                  <td className="px-5 py-3 text-xs text-charcoal-soft">{formatDate(l.createdAt)}</td>
                  <td className="px-5 py-3 font-mono text-xs">{l.templateCode}</td>
                  <td className="px-5 py-3 text-charcoal-soft">{l.phone}</td>
                  <td className="px-5 py-3">
                    <Badge tone={l.status === 'SENT' ? 'green' : l.status === 'FAILED' ? 'red' : 'amber'}>{l.status}</Badge>
                  </td>
                  <td className="px-5 py-3 text-xs text-red-600">{l.error ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  )
}
