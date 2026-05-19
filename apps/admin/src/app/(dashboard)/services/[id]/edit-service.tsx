'use client'

import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { adminApi } from '@/lib/api'
import { Card } from '@/components/ui/card'
import { Spinner } from '@/components/ui/empty'
import { ServiceForm } from '../service-form'

type Service = {
  id: string
  slug: string
  name: string
  description: string
  priceIdr: number
  durationMin: number
  ageMinMonth: number
  ageMaxMonth: number
  imageUrl: string | null
  gallery: string[]
  active: boolean
}

export function EditServiceClient({ id }: { id: string }) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['service', id],
    queryFn: () => adminApi<Service>(`/admin/services/${id}`)
  })

  if (isLoading) {
    return (
      <Card className="flex items-center justify-center py-16">
        <Spinner />
      </Card>
    )
  }
  if (isError || !data) {
    return <Card className="text-sm text-red-600">Layanan tidak ditemukan.</Card>
  }

  return (
    <div className="space-y-6">
      <div>
        <Link href="/services" className="inline-flex items-center gap-1 text-xs font-semibold text-charcoal-soft hover:text-gayatri-600">
          <span className="material-symbols-outlined text-[16px]">arrow_back</span>
          Kembali
        </Link>
        <h1 className="mt-2 font-display text-2xl font-medium text-gayatri-600 md:text-3xl">Edit {data.name}</h1>
      </div>
      <ServiceForm id={id} initial={{ ...data, imageUrl: data.imageUrl ?? '' }} />
    </div>
  )
}
