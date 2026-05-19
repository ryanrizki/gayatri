'use client'

import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { adminApi } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/components/ui/toast'

export function RescheduleDialog({ id, onDone }: { id: string; onDone: () => void }) {
  const [open, setOpen] = useState(false)
  const [scheduledAt, setScheduledAt] = useState('')
  const { toast } = useToast()

  const m = useMutation({
    mutationFn: () =>
      adminApi(`/admin/checkouts/${id}/reschedule`, {
        method: 'POST',
        body: { scheduledAt: new Date(scheduledAt).toISOString() }
      }),
    onSuccess: () => {
      toast({ variant: 'success', title: 'Jadwal diperbarui' })
      setOpen(false)
      onDone()
    },
    onError: (e: Error) => toast({ variant: 'error', title: 'Gagal jadwal ulang', description: e.message })
  })

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="secondary" size="sm">
          <span className="material-symbols-outlined text-[18px]">event_repeat</span>
          Jadwal Ulang
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Jadwal Ulang</DialogTitle>
          <p className="text-sm text-charcoal-soft">Pilih tanggal dan waktu baru.</p>
        </DialogHeader>
        <div>
          <Label htmlFor="reschedule-at">Tanggal & Waktu Baru</Label>
          <Input id="reschedule-at" type="datetime-local" value={scheduledAt} onChange={(e) => setScheduledAt(e.target.value)} />
        </div>
        <DialogFooter>
          <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>Batal</Button>
          <Button size="sm" onClick={() => m.mutate()} disabled={!scheduledAt || m.isPending}>
            {m.isPending ? 'Memproses...' : 'Simpan'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
