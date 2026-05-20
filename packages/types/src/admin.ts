import { z } from 'zod'

export const AdminLogin = z.object({
  email: z.string().email(),
  password: z.string().min(6).max(200)
})
export type AdminLogin = z.infer<typeof AdminLogin>

export const AdminRole = z.enum(['OWNER', 'ADMIN', 'STAFF'])
export type AdminRole = z.infer<typeof AdminRole>

// ----- Catalog DTOs -----

const slug = z.string().min(1).max(80).regex(/^[a-z0-9-]+$/)
const url = z.string().url().max(2048)
const httpsUrl = z.string().url().max(2048).refine((u) => /^https?:\/\//i.test(u), 'must be http(s)')
const optionalUrl = httpsUrl.nullable().optional()
const galleryArr = z.array(httpsUrl).max(20).default([])

export const ServiceCreate = z.object({
  slug,
  name: z.string().min(2).max(120),
  description: z.string().min(10).max(2000),
  priceIdr: z.number().int().min(0).max(1_000_000_000),
  durationMin: z.number().int().min(5).max(480),
  ageMinMonth: z.number().int().min(0).max(120),
  ageMaxMonth: z.number().int().min(0).max(120),
  imageUrl: optionalUrl,
  gallery: galleryArr,
  active: z.boolean().default(true)
})
export type ServiceCreate = z.infer<typeof ServiceCreate>
export const ServiceUpdate = ServiceCreate.partial()
export type ServiceUpdate = z.infer<typeof ServiceUpdate>

export const ProductCreate = z.object({
  slug,
  name: z.string().min(2).max(120),
  description: z.string().min(10).max(2000),
  priceIdr: z.number().int().min(0).max(1_000_000_000),
  stock: z.number().int().min(0).max(1_000_000),
  stockThreshold: z.number().int().min(0).max(1_000_000),
  categoryId: z.string().cuid(),
  imageUrl: optionalUrl,
  gallery: galleryArr,
  active: z.boolean().default(true)
})
export type ProductCreate = z.infer<typeof ProductCreate>
export const ProductUpdate = ProductCreate.partial()
export type ProductUpdate = z.infer<typeof ProductUpdate>

export const CategoryCreate = z.object({
  slug,
  name: z.string().min(1).max(120),
  order: z.number().int().min(0).max(9999).default(0)
})
export type CategoryCreate = z.infer<typeof CategoryCreate>
export const CategoryUpdate = CategoryCreate.partial()
export type CategoryUpdate = z.infer<typeof CategoryUpdate>

export const BannerCreate = z.object({
  imageUrl: httpsUrl,
  link: z.string().max(2048).nullable().optional(),
  title: z.string().max(200).nullable().optional(),
  order: z.number().int().min(0).max(9999).default(0),
  active: z.boolean().default(true)
})
export type BannerCreate = z.infer<typeof BannerCreate>
export const BannerUpdate = BannerCreate.partial()
export type BannerUpdate = z.infer<typeof BannerUpdate>

export const BranchCreate = z.object({
  name: z.string().min(2).max(120),
  address: z.string().min(2).max(500),
  phone: z.string().max(40).nullable().optional(),
  active: z.boolean().default(true)
})
export type BranchCreate = z.infer<typeof BranchCreate>
export const BranchUpdate = BranchCreate.partial()
export type BranchUpdate = z.infer<typeof BranchUpdate>

export const TherapistCreate = z.object({
  name: z.string().min(2).max(120),
  phone: z.string().max(40).nullable().optional(),
  active: z.boolean().default(true)
})
export type TherapistCreate = z.infer<typeof TherapistCreate>
export const TherapistUpdate = TherapistCreate.partial()
export type TherapistUpdate = z.infer<typeof TherapistUpdate>

export const CustomerUpdate = z.object({
  name: z.string().min(2).max(120).optional(),
  phone: z.string().max(40).optional(),
  email: z.string().email().max(200).nullable().optional(),
  address: z.string().max(500).nullable().optional(),
  notes: z.string().max(2000).nullable().optional()
})
export type CustomerUpdate = z.infer<typeof CustomerUpdate>

export const WaTemplateUpdate = z.object({
  name: z.string().min(1).max(200).optional(),
  body: z.string().min(1).max(4000).optional(),
  active: z.boolean().optional()
})
export type WaTemplateUpdate = z.infer<typeof WaTemplateUpdate>

export const SETTINGS_KEYS = [
  'business_name',
  // Receives admin WA notifications (T-ADM-*). Read by wa.service.notifyAdmin*.
  'admin_wa_number',
  'business_phone',
  'business_email',
  'business_address',
  'business_hours',
  'about_title',
  'about_body',
  'footer_tagline'
] as const
export type SettingKey = (typeof SETTINGS_KEYS)[number]

// Intl Indonesia WA: 62 + 8-14 digits (no leading +/0).
const adminWaRegex = /^62[0-9]{8,14}$/
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
// "" or valid -> allows empty for optional-with-format fields.
const emptyOr = (re: RegExp, msg: string) =>
  z.string().refine((v) => v === '' || re.test(v), { message: msg })

export const SettingsUpsert = z
  .object({
    business_name: z.string().max(200).optional(),
    admin_wa_number: emptyOr(adminWaRegex, 'admin_wa_number: 62 + 8–14 angka, tanpa 0/+').optional(),
    business_phone: z.string().max(50).optional(),
    business_email: emptyOr(emailRegex, 'business_email: format email tidak valid').optional(),
    business_address: z.string().max(500).optional(),
    business_hours: z.string().max(1000).optional(),
    about_title: z.string().max(200).optional(),
    about_body: z.string().max(4000).optional(),
    footer_tagline: z.string().max(200).optional()
  })
  .strict() // unknown keys produce a precise path -> better client errors
export type SettingsUpsert = z.infer<typeof SettingsUpsert>
