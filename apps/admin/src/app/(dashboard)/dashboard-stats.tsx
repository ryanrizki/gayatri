'use client'

import { useQuery } from '@tanstack/react-query'
import { adminApi } from '@/lib/api'
import { formatIdr } from '@/lib/format'
import { Card } from '@/components/ui/card'
import { StatCard } from '@/components/ui/stat-card'
import { Spinner } from '@/components/ui/empty'

type Stats = { newCount: number; todaySchedule: number; weekRevenue: number }

export function DashboardStats() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => adminApi<Stats>('/admin/dashboard'),
    refetchInterval: 60_000
  })

  if (isLoading) {
    return (
      <Card className="flex items-center justify-center py-16">
        <Spinner />
      </Card>
    )
  }
  if (isError || !data) {
    return <Card className="text-sm text-red-600">Gagal memuat ringkasan.</Card>
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <StatCard
        label="Pesanan Baru"
        value={data.newCount.toString()}
        icon="inbox"
        href="/checkouts?status=NEW"
        badge="Perlu tindakan"
        badgeTone="neutral"
      />
      <StatCard
        label="Jadwal Hari Ini"
        value={data.todaySchedule.toString()}
        icon="calendar_today"
        href="/checkouts?status=CONFIRMED"
        badge="Hari ini"
        badgeTone="neutral"
      />
      <StatCard
        label="Pendapatan 7 Hari"
        value={formatIdr(data.weekRevenue)}
        icon="payments"
        href="/checkouts?status=DONE"
      />
    </div>
  )
}
