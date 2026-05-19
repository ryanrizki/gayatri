'use client'

import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { adminApi } from '@/lib/api'
import { Card } from '@/components/ui/card'
import { Input, Textarea } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { PageHeader } from '@/components/catalog/PageHeader'
import { EmptyState, Spinner } from '@/components/ui/empty'
import { useToast } from '@/components/ui/toast'

type Branch = { id: string; name: string; address: string; phone: string | null; active: boolean }

export function BranchesManager() {
  const qc = useQueryClient()
  const { data, isLoading } = useQuery({
    queryKey: ['branches'],
    queryFn: () => adminApi<Branch[]>('/admin/branches')
  })

  return (
    <div className="space-y-6">
      <PageHeader
        title="Cabang"
        description="Lokasi spa yang dapat dipilih saat konfirmasi pesanan."
        action={<BranchFormDialog mode="create" />}
      />
      {isLoading && (
        <Card className="flex items-center justify-center py-16">
          <Spinner />
        </Card>
      )}
      {!isLoading && data && data.length === 0 && <EmptyState icon="store" title="Belum ada cabang" />}
      {!isLoading && data && data.length > 0 && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {data.map((b) => (
            <Card key={b.id}>
              <div className="mb-2 flex items-start justify-between gap-2">
                <h3 className="font-semibold text-charcoal">{b.name}</h3>
                <Badge tone={b.active ? 'green' : 'neutral'}>{b.active ? 'Aktif' : 'Nonaktif'}</Badge>
              </div>
              <p className="mb-1 text-sm text-charcoal-soft">{b.address}</p>
              {b.phone && <p className="mb-4 text-xs text-charcoal-soft">{b.phone}</p>}
              <BranchFormDialog mode="edit" initial={b} />
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

function BranchFormDialog({ mode, initial }: { mode: 'create' | 'edit'; initial?: Branch }) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState(initial?.name ?? '')
  const [address, setAddress] = useState(initial?.address ?? '')
  const [phone, setPhone] = useState(initial?.phone ?? '')
  const [active, setActive] = useState(initial?.active ?? true)
  const qc = useQueryClient()
  const { toast } = useToast()

  const m = useMutation({
    mutationFn: () => {
      const body = { name, address, phone: phone || null, active }
      return mode === 'edit' && initial
        ? adminApi(`/admin/branches/${initial.id}`, { method: 'PATCH', body })
        : adminApi('/admin/branches', { method: 'POST', body })
    },
    onSuccess: () => {
      toast({ variant: 'success', title: 'Disimpan' })
      qc.invalidateQueries({ queryKey: ['branches'] })
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
          setName(initial.name); setAddress(initial.address); setPhone(initial.phone ?? ''); setActive(initial.active)
        } else if (o) {
          setName(''); setAddress(''); setPhone(''); setActive(true)
        }
      }}
    >
      <DialogTrigger asChild>
        {mode === 'edit' ? (
          <Button variant="secondary" size="sm">
            <span className="material-symbols-outlined text-[18px]">edit</span>
            Edit
          </Button>
        ) : (
          <Button>
            <span className="material-symbols-outlined text-[18px]">add</span>
            Tambah Cabang
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{mode === 'edit' ? 'Edit Cabang' : 'Cabang Baru'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="br-name">Nama Cabang</Label>
            <Input id="br-name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="br-address">Alamat</Label>
            <Textarea id="br-address" rows={3} value={address} onChange={(e) => setAddress(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="br-phone">Telepon (opsional)</Label>
            <Input id="br-phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} className="h-4 w-4 accent-gayatri-600" />
            Aktif
          </label>
        </div>
        <DialogFooter>
          <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>Batal</Button>
          <Button size="sm" onClick={() => m.mutate()} disabled={!name || !address || m.isPending}>
            {m.isPending ? 'Menyimpan...' : 'Simpan'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
