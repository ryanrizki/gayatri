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

type Therapist = { id: string; name: string; phone: string | null; active: boolean }

export function TherapistsManager() {
  const { data, isLoading } = useQuery({
    queryKey: ['therapists'],
    queryFn: () => adminApi<Therapist[]>('/admin/therapists')
  })

  return (
    <div className="space-y-6">
      <PageHeader
        title="Terapis"
        description="Daftar terapis untuk penugasan saat konfirmasi pesanan."
        action={<TherapistFormDialog mode="create" />}
      />
      {isLoading && (
        <Card className="flex items-center justify-center py-16">
          <Spinner />
        </Card>
      )}
      {!isLoading && data && data.length === 0 && <EmptyState icon="group" title="Belum ada terapis" />}
      {!isLoading && data && data.length > 0 && (
        <Card className="overflow-hidden p-0">
          <table className="w-full text-sm">
            <thead className="bg-cream-100 text-left text-[11px] uppercase tracking-wider text-charcoal-soft">
              <tr>
                <th className="px-5 py-3 font-semibold">Nama</th>
                <th className="px-5 py-3 font-semibold">Telepon</th>
                <th className="px-5 py-3 font-semibold">Status</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-soft/20">
              {data.map((t) => (
                <tr key={t.id} className="hover:bg-cream-100">
                  <td className="px-5 py-3 font-semibold text-charcoal">{t.name}</td>
                  <td className="px-5 py-3 text-charcoal-soft">{t.phone ?? '—'}</td>
                  <td className="px-5 py-3">
                    <Badge tone={t.active ? 'green' : 'neutral'}>{t.active ? 'Aktif' : 'Nonaktif'}</Badge>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <TherapistFormDialog mode="edit" initial={t} />
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

function TherapistFormDialog({ mode, initial }: { mode: 'create' | 'edit'; initial?: Therapist }) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState(initial?.name ?? '')
  const [phone, setPhone] = useState(initial?.phone ?? '')
  const [active, setActive] = useState(initial?.active ?? true)
  const qc = useQueryClient()
  const { toast } = useToast()

  const m = useMutation({
    mutationFn: () => {
      const body = { name, phone: phone || null, active }
      return mode === 'edit' && initial
        ? adminApi(`/admin/therapists/${initial.id}`, { method: 'PATCH', body })
        : adminApi('/admin/therapists', { method: 'POST', body })
    },
    onSuccess: () => {
      toast({ variant: 'success', title: 'Disimpan' })
      qc.invalidateQueries({ queryKey: ['therapists'] })
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
          setName(initial.name); setPhone(initial.phone ?? ''); setActive(initial.active)
        } else if (o) {
          setName(''); setPhone(''); setActive(true)
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
            Tambah Terapis
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{mode === 'edit' ? 'Edit Terapis' : 'Terapis Baru'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="t-name">Nama</Label>
            <Input id="t-name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="t-phone">Telepon (opsional)</Label>
            <Input id="t-phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} className="h-4 w-4 accent-gayatri-600" />
            Aktif
          </label>
        </div>
        <DialogFooter>
          <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>Batal</Button>
          <Button size="sm" onClick={() => m.mutate()} disabled={!name || m.isPending}>
            {m.isPending ? 'Menyimpan...' : 'Simpan'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
