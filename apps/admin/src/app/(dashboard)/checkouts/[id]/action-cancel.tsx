'use client'

import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { adminApi } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/components/ui/toast'

export function CancelDialog({ id, onDone }: { id: string; onDone: () => void }) {
  const [open, setOpen] = useState(false)
  const [reason, setReason] = useState('')
  const { toast } = useToast()

  const m = useMutation({
    mutationFn: () =>
      adminApi(`/admin/checkouts/${id}/cancel`, {
        method: 'POST',
        body: { reason: reason.trim() }
      }),
    onSuccess: () => {
      toast({ variant: 'success', title: 'Pesanan dibatalkan' })
      setOpen(false)
      setReason('')
      onDone()
    },
    onError: (e: Error) => toast({ variant: 'error', title: 'Gagal batalkan', description: e.message })
  })

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="danger" size="sm">
          <span className="material-symbols-outlined text-[18px]">cancel</span>
          Batalkan
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Batalkan Pesanan</DialogTitle>
          <p className="text-sm text-charcoal-soft">Stok produk akan dikembalikan jika sebelumnya sudah dikonfirmasi.</p>
        </DialogHeader>
        <div>
          <Label htmlFor="reason">Alasan Pembatalan</Label>
          <Textarea
            id="reason"
            rows={4}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Contoh: pelanggan minta dibatalkan via WA"
          />
        </div>
        <DialogFooter>
          <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>Tutup</Button>
          <Button variant="danger" size="sm" onClick={() => m.mutate()} disabled={!reason.trim() || m.isPending}>
            {m.isPending ? 'Memproses...' : 'Batalkan'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
