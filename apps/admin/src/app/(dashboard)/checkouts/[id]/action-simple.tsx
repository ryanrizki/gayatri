'use client'

import { useMutation } from '@tanstack/react-query'
import { adminApi } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/toast'

export function SimpleActionButton({
  id,
  action,
  label,
  icon,
  onDone
}: {
  id: string
  action: 'ongoing' | 'done'
  label: string
  icon: string
  onDone: () => void
}) {
  const { toast } = useToast()
  const m = useMutation({
    mutationFn: () => adminApi(`/admin/checkouts/${id}/${action}`, { method: 'POST' }),
    onSuccess: () => {
      toast({ variant: 'success', title: `Status diperbarui: ${label}` })
      onDone()
    },
    onError: (e: Error) => toast({ variant: 'error', title: 'Gagal', description: e.message })
  })

  return (
    <Button size="sm" onClick={() => m.mutate()} disabled={m.isPending}>
      <span className="material-symbols-outlined text-[18px]">{icon}</span>
      {label}
    </Button>
  )
}
