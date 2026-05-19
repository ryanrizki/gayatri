import { api } from '@/lib/api'
import { Footer, TopNav } from '@/components/site-shell'
import { getWaNumber } from '@/lib/config'
import type { ServiceDto } from '@gayatri/types'
import { CheckoutForm } from './checkout-form'

export const revalidate = 60

const PLACEHOLDER_SERVICES: ServiceDto[] = [
  {
    id: 'p1',
    slug: 'baby-massage-bath',
    name: 'Baby Massage & Bath',
    description: 'Pijat stimulasi tumbuh kembang dan mandi air hangat aromaterapi.',
    priceIdr: 150_000,
    durationMin: 60,
    ageMinMonth: 1,
    ageMaxMonth: 24,
    imageUrl: null,
    gallery: [],
    active: true
  },
  {
    id: 'p2',
    slug: 'baby-swim-hydrotherapy',
    name: 'Baby Swim (Hydrotherapy)',
    description: 'Terapi air untuk melatih motorik kasar dan meningkatkan nafsu makan.',
    priceIdr: 125_000,
    durationMin: 45,
    ageMinMonth: 3,
    ageMaxMonth: 24,
    imageUrl: null,
    gallery: [],
    active: true
  },
  {
    id: 'p3',
    slug: 'baby-spa-combo',
    name: 'Baby Spa Combo',
    description: 'Kombinasi pijat + berenang + spa lengkap untuk relaksasi maksimal.',
    priceIdr: 230_000,
    durationMin: 90,
    ageMinMonth: 3,
    ageMaxMonth: 24,
    imageUrl: null,
    gallery: [],
    active: true
  }
]

export default async function CheckoutPage({
  searchParams
}: {
  searchParams?: { service?: string }
}) {
  const services = await api<ServiceDto[]>('/v1/catalog/services').catch(() => [] as ServiceDto[])
  const list = services.length > 0 ? services : PLACEHOLDER_SERVICES
  const waNumber = getWaNumber()
  const preselectSlug = searchParams?.service

  return (
    <>
      <TopNav active="services" />
      <main className="mx-auto max-w-7xl px-5 py-12 md:px-20 md:py-16">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <h1 className="mb-4 font-display text-[28px] font-medium leading-9 text-gayatri-600 md:text-3xl md:leading-10">
            Pemesanan Layanan
          </h1>
          <p className="text-base text-charcoal-soft">
            Lengkapi detail di bawah ini untuk merencanakan momen relaksasi si kecil bersama terapis profesional kami.
          </p>
        </div>
        <CheckoutForm services={list} preselectSlug={preselectSlug} waNumber={waNumber} />
      </main>
      <Footer waNumber={waNumber} />
    </>
  )
}
