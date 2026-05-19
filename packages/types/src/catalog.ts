import { z } from 'zod'

export const ServiceDto = z.object({
  id: z.string(),
  slug: z.string(),
  name: z.string(),
  description: z.string(),
  priceIdr: z.number(),
  durationMin: z.number(),
  ageMinMonth: z.number(),
  ageMaxMonth: z.number(),
  imageUrl: z.string().nullable(),
  gallery: z.array(z.string()),
  active: z.boolean()
})
export type ServiceDto = z.infer<typeof ServiceDto>

export const ProductDto = z.object({
  id: z.string(),
  slug: z.string(),
  name: z.string(),
  description: z.string(),
  priceIdr: z.number(),
  stock: z.number(),
  imageUrl: z.string().nullable(),
  categoryId: z.string(),
  active: z.boolean()
})
export type ProductDto = z.infer<typeof ProductDto>

export const CategoryDto = z.object({
  id: z.string(),
  slug: z.string(),
  name: z.string(),
  order: z.number()
})
export type CategoryDto = z.infer<typeof CategoryDto>

export const BannerDto = z.object({
  id: z.string(),
  imageUrl: z.string(),
  link: z.string().nullable(),
  title: z.string().nullable(),
  order: z.number()
})
export type BannerDto = z.infer<typeof BannerDto>
