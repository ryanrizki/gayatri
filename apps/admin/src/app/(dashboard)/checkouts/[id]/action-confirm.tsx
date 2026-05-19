'use client'

import { useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { adminApi } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/components/ui/toast'

type Branch = { id: string; name: string }
type Therapist = { id: string; name: string; branchId: string | null }

export function ConfirmDialog({ id, onDone }: { id: string; onDone: () => void }) {
  const [open, setOpen] = useState(false)
  const [scheduledAt, setScheduledAt] = useState('')
  const [branchId, setBranchId] = useState('')
  const [therapistId, setTherapistId] = useState('')
  const { toast } = useToast()

  const branches = useQuery({
    queryKey: ['branches'],
    queryFn: () => adminApi<Branch[]>('/admin/branches'),
    enabled: open
  })
  const therapists = useQuery({
    queryKey: ['therapists'],
    queryFn: () => adminApi<Therapist[]>('/admin/therapists'),
    enabled: open
  })

  const m = useMutation({
    mutationFn: () =>
      adminApi(`/admin/checkouts/${id}/confirm`, {
        method: 'POST',
        body: {
          scheduledAt: new Date(scheduledAt).toISOString(),
          branchId: branchId || undefined,
          therapistId: therapistId || undefined
        }
      }),
    onSuccess: () => {
      toast({ variant: 'success', title: 'Pesanan dikonfirmasi', description: 'Notifikasi WA dikirim ke pelanggan.' })
      setOpen(false)
      onDone()
    },
    onError: (e: Error) => toast({ variant: 'error', title: 'Gagal konfirmasi', description: e.message })
  })

  const canSubmit = !!scheduledAt

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <span className="material-symbols-outlined text-[18px]">check</span>
          Konfirmasi
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Konfirmasi Pesanan</DialogTitle>
          <p className="text-sm text-charcoal-soft">Tentukan jadwal, cabang, dan terapis. Stok produk akan dikurangi otomatis.</p>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="scheduledAt">Tanggal & Waktu</Label>
            <Input
              id="scheduledAt"
              type="datetime-local"
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="branchId">Cabang (opsional)</Label>
            <select
              id="branchId"
              value={branchId}
              onChange={(e) => setBranchId(e.target.value)}
              className="w-full rounded-xl border border-outline-soft/40 bg-white px-4 py-2.5 text-sm focus:border-gayatri-600 focus:outline-none focus:ring-2 focus:ring-gayatri-600/20"
            >
              <option value="">— Pilih cabang —</option>
              {branches.data?.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label htmlFor="therapistId">Terapis (opsional)</Label>
            <select
              id="therapistId"
              value={therapistId}
              onChange={(e) => setTherapistId(e.target.value)}
              className="w-full rounded-xl border border-outline-soft/40 bg-white px-4 py-2.5 text-sm focus:border-gayatri-600 focus:outline-none focus:ring-2 focus:ring-gayatri-600/20"
            >
              <option value="">— Pilih terapis —</option>
              {therapists.data
                ?.filter((t) => !branchId || t.branchId === branchId || !t.branchId)
                .map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
            </select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>Batal</Button>
          <Button size="sm" onClick={() => m.mutate()} disabled={!canSubmit || m.isPending}>
            {m.isPending ? 'Memproses...' : 'Konfirmasi'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
