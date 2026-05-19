'use client'

import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { adminApi } from '@/lib/api'
import { Card } from '@/components/ui/card'
import { Spinner } from '@/components/ui/empty'
import { ProductForm } from '../product-form'

type Product = {
  id: string
  slug: string
  name: string
  description: string
  priceIdr: number
  stock: number
  stockThreshold: number
  imageUrl: string | null
  gallery: string[]
  categoryId: string
  active: boolean
}

export function EditProductClient({ id }: { id: string }) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['product', id],
    queryFn: () => adminApi<Product>(`/admin/products/${id}`)
  })

  if (isLoading) {
    return (
      <Card className="flex items-center justify-center py-16">
        <Spinner />
      </Card>
    )
  }
  if (isError || !data) {
    return <Card className="text-sm text-red-600">Produk tidak ditemukan.</Card>
  }

  return (
    <div className="space-y-6">
      <div>
        <Link href="/products" className="inline-flex items-center gap-1 text-xs font-semibold text-charcoal-soft hover:text-gayatri-600">
          <span className="material-symbols-outlined text-[16px]">arrow_back</span>
          Kembali
        </Link>
        <h1 className="mt-2 font-display text-2xl font-medium text-gayatri-600 md:text-3xl">Edit {data.name}</h1>
      </div>
      <ProductForm id={id} initial={{ ...data, imageUrl: data.imageUrl ?? '' }} />
    </div>
  )
}
