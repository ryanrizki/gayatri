import { api } from '@/lib/api'
import { Footer, TopNav, WaFloating } from '@/components/site-shell'
import { getWaNumber } from '@/lib/config'
import { formatDuration, formatIdr, formatIdrShort } from '@/lib/format'
import type { ServiceDto } from '@gayatri/types'
import Link from 'next/link'

export const revalidate = 60

const PLACEHOLDER_SERVICES: ServiceDto[] = [
  {
    id: 'p1',
    slug: 'pijat-bayi-tradisional',
    name: 'Pijat Bayi Tradisional',
    description: 'Stimulasi lembut untuk melancarkan peredaran darah dan meningkatkan kualitas tidur bayi Anda.',
    priceIdr: 150_000,
    durationMin: 45,
    ageMinMonth: 1,
    ageMaxMonth: 24,
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAX5CEcP6PZ31skqyeQO0LF61YG64I93mKR5gNlav4sgBS0V7HB_oD6B8wJz_N6lJzi3zAQ53jIKnxpJMpfZraYHrOtjAIZC1C1G0GWei18ALlcQzrb3SvqgB_B7bdJ1IT5_3tmFvojUdnmUhfFRgLjKUxUXm3Aqw_QrGoX_N_0LSTbqbBccjrgj3boCbBnKYrjCKu_PwUCcbNJ-hrrkC36oMKSQ6ZyoE6YJHcwpzCEOjd9Oeh8yYjPQS78odQWJKkW9hCpPWdTfPw',
    gallery: [],
    active: true
  },
  {
    id: 'p2',
    slug: 'baby-swim-float',
    name: 'Baby Swim & Float',
    description: 'Melatih motorik kasar dan keberanian si kecil di dalam air hangat yang steril.',
    priceIdr: 185_000,
    durationMin: 30,
    ageMinMonth: 3,
    ageMaxMonth: 24,
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAFrhrEUvgh3YsCs2loNzrBdCSRuCjbmru62MieFD7yKS1t3XVzIOMZ6xy4gY_FXN-ubVrmHni5JUjLW2j0Gvo8skLz3BOzhjDgxngyIj49pY9_du3wu8Y_zBk04LmFLg2ciki_G9PsLbd2POxg7EoSStVX0TWGOrXNtJjTBX-C5IR4IV57moRLDN1Uictj0e5AQ2B1c205OMS4Iisi1xg6eGV-0gb8hDaDOHozjan-AEgmuuNCzCqmiLJd6Xocmc7wsv_tTWs-Z9k',
    gallery: [],
    active: true
  },
  {
    id: 'p3',
    slug: 'sensory-skin-care',
    name: 'Sensory Skin Care',
    description: 'Perawatan kulit dengan bahan organik premium untuk menjaga kelembapan kulit bayi yang sensitif.',
    priceIdr: 120_000,
    durationMin: 40,
    ageMinMonth: 0,
    ageMaxMonth: 36,
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuChoJALdVyoAiS9ym-_HSlaamPYGOPfqhVGOl6HxyBo28Hr_nU52V_eCrp5LIogE_1Rw_wS8oE92yrN8SVD121Bl8qiXgTrJraYp7KCCybXWDcrA5Lh8okW2aOvQju-eYNLk4i8tQ9Z-JAPyI1_wfhOMCA7qKeKBqzm_OuM8aFpAFSQ6Fz084fNhfjUtLBAZlE5AWvRCFQideqJW7l6fg2mMr4IiOme-cmu9y5-iDYsvAWSNyZbzHTL2WLBmIBTGnLS66kh-GVwFrk',
    gallery: [],
    active: true
  },
  {
    id: 'p4',
    slug: 'paket-combo-sehat',
    name: 'Paket Combo Sehat',
    description: 'Kombinasi Pijat Bayi dan Berenang untuk relaksasi maksimal dan kebugaran tubuh.',
    priceIdr: 300_000,
    durationMin: 75,
    ageMinMonth: 3,
    ageMaxMonth: 24,
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDvcyzbBn-L9o24YesFWwaH4cqMiUH1e7xybiKMh2jpWt15vSiwqL4Oy0LVA6DNKdV5Wcjy2ZOq0uOZVN-Ihwg-llTSn76qbs-hFkTX6kXzWUAT8nGbxSNEpVZp-KcpVkQjPf1u7EQjIrBq9Zf7_7t7jdO1aoEGKnP6g-Y2ACmFLp5FR27aiPNSvJmAaVEtlHpRIDE_kY8ysjeIVUuvv-oCLMsJuXM9Sv0IpnVt9tmZOLlXrSbHQl_COoGYxt9uFmT6u0wzVEJAxfE',
    gallery: [],
    active: true
  },
  {
    id: 'p5',
    slug: 'pijat-kolik-pencernaan',
    name: 'Pijat Kolik & Pencernaan',
    description: 'Teknik pijat khusus untuk meredakan kembung dan kolik pada bayi baru lahir.',
    priceIdr: 160_000,
    durationMin: 35,
    ageMinMonth: 0,
    ageMaxMonth: 12,
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBDvHfreghq8ca8pg05y20qI3dMjTfE-15vw3DIcrffmz9zBEOQViCxKianho03ROswqpF60k6bLiAcfo1Sk-RwzcAKD4hqKTQk56k4-5hUMi6_XPdmvJDP_sTTbiIXhFx5qf53ASg5hPlukNh_NbpY_BxfJlKaH5ml-Sed7Cr4INr6v5o1bmWWQjmR1ZtH4v1P5wldGcHKBYTjuzloPMcVrecla6uajzAtf62B2xFMHjjrQt1sjgZktGGsVF6hxCfgyiJz0aSmGDM',
    gallery: [],
    active: true
  },
  {
    id: 'p6',
    slug: 'toddler-relaxation-massage',
    name: 'Toddler Relaxation Massage',
    description: 'Pijat relaksasi untuk anak usia 1-3 tahun guna mengurangi kelelahan setelah beraktivitas.',
    priceIdr: 175_000,
    durationMin: 50,
    ageMinMonth: 12,
    ageMaxMonth: 36,
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCTCak9N0qNMMBLqvqZbrF24QzisJNjrsJ8RWCEBlUsAPd1SJ6CCy8-iTqvkXM9rOTeMRP5k40x9HsybxTKi6KqzhYuiqKA6gJKBndFDrkdNG2WAiMG940Ceqh8WgJL57ZeEcjM68HzOyVTDqf7p9HV5RPKY70dhNoSjK95k4OdHfy8kXXZCtRBWAEILNUcR9t5QiWZDVfOROK247BLkUvlZTJRfY83N1jmZW6UdouDiy5RTI4xm7_KX1piQZMt5N0L5A8OISDQCY4',
    gallery: [],
    active: true
  }
]

const FILTER_CATEGORIES = ['Semua Layanan', 'Pijat Bayi', 'Hydrotherapy', 'Perawatan Kulit'] as const

export default async function ServicesPage() {
  const services = await api<ServiceDto[]>('/v1/catalog/services').catch(() => [] as ServiceDto[])
  const displayed = services.length > 0 ? services : PLACEHOLDER_SERVICES
  const waNumber = getWaNumber()

  return (
    <>
      <TopNav active="services" />
      <main className="mx-auto max-w-7xl">
        <section className="px-5 pb-12 pt-12 text-center md:px-20 md:pt-16">
          <h1 className="mb-4 font-display text-4xl font-semibold tracking-tight text-gayatri-600 md:text-5xl md:leading-[56px]">
            Pilih Perawatan untuk Sang Buah Hati
          </h1>
          <p className="mx-auto mb-10 max-w-2xl text-lg leading-7 text-charcoal-soft">
            Setiap sentuhan kami diberikan dengan penuh ketulusan untuk menunjang tumbuh kembang optimal bayi Anda
            dalam suasana yang menenangkan.
          </p>
          <CategoryFilter />
        </section>

        <section className="px-5 pb-16 md:px-20">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-2 md:gap-6 lg:grid-cols-3">
            {displayed.map((s) => (
              <ServiceCard key={s.id} service={s} />
            ))}
          </div>
        </section>

        <section className="px-5 pb-16 md:px-20">
          <div className="flex flex-col items-center rounded-[32px] bg-gayatri-600 p-10 text-center text-white md:p-16">
            <span className="material-symbols-outlined mb-6 text-5xl md:text-6xl">spa</span>
            <h2 className="mb-4 font-display text-[28px] font-medium leading-9 md:text-3xl md:leading-10">
              Ingin Konsultasi Terlebih Dahulu?
            </h2>
            <p className="mb-8 max-w-xl text-lg leading-7 opacity-90">
              Hubungi spesialis kami untuk menentukan paket perawatan yang paling sesuai dengan kebutuhan tumbuh
              kembang buah hati Anda.
            </p>
            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:gap-4">
              <a
                href={`https://wa.me/${waNumber}`}
                target="_blank"
                rel="noreferrer"
                className="rounded-full bg-white px-8 py-4 text-sm font-semibold tracking-wide text-gayatri-600 transition-all hover:bg-cream-100"
              >
                Hubungi via WhatsApp
              </a>
              <Link
                href="/about"
                className="rounded-full border border-white/40 px-8 py-4 text-sm font-semibold tracking-wide text-white transition-all hover:bg-white/10"
              >
                Tentang Gayatri
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer waNumber={waNumber} />
      <WaFloating waNumber={waNumber} />
    </>
  )
}

function CategoryFilter() {
  return (
    <div className="-mx-5 flex justify-start gap-3 overflow-x-auto px-5 pb-2 md:mx-0 md:flex-wrap md:justify-center md:overflow-visible md:px-0">
      {FILTER_CATEGORIES.map((cat, i) => (
        <button
          key={cat}
          className={
            i === 0
              ? 'shrink-0 whitespace-nowrap rounded-full bg-gayatri-600 px-6 py-2.5 text-sm font-semibold tracking-wide text-white shadow-sm'
              : 'shrink-0 whitespace-nowrap rounded-full border border-outline-soft/30 bg-cream-100 px-6 py-2.5 text-sm font-semibold tracking-wide text-charcoal-soft transition-colors hover:bg-gayatri-50'
          }
        >
          {cat}
        </button>
      ))}
    </div>
  )
}

function ServiceCard({ service }: { service: ServiceDto }) {
  return (
    <Link
      href={`/services/${service.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-outline-soft/30 bg-white shadow-glow transition-transform duration-300 hover:-translate-y-1"
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        {service.imageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={service.imageUrl}
            alt={service.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        )}
        <div className="absolute left-3 top-3 md:left-4 md:top-4">
          <span className="rounded-full bg-peach-100 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-charcoal-soft md:text-xs">
            {formatDuration(service.durationMin)}
          </span>
        </div>
      </div>
      <div className="flex flex-1 flex-col p-4 md:p-6">
        <h3 className="mb-1 text-base font-semibold leading-tight text-gayatri-600 md:mb-2 md:text-[22px] md:leading-7">
          {service.name}
        </h3>
        <p className="mb-3 line-clamp-2 text-xs text-charcoal-soft md:mb-4 md:text-base">{service.description}</p>
        <div className="mt-auto flex items-center justify-between border-t border-outline-soft/20 pt-3 md:pt-4">
          <div className="flex flex-col gap-1">
            <span className="hidden items-center gap-1 text-xs text-charcoal-soft md:flex">
              <span className="material-symbols-outlined text-[16px]">schedule</span>
              {formatDuration(service.durationMin)}
            </span>
            <span className="text-sm font-bold text-gayatri-600 md:text-[22px] md:font-semibold md:leading-7">
              <span className="md:hidden">{formatIdrShort(service.priceIdr)}</span>
              <span className="hidden md:inline">{formatIdr(service.priceIdr)}</span>
            </span>
          </div>
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gayatri-600 text-white transition-colors md:h-10 md:w-10 md:bg-gayatri-50 md:text-gayatri-600 md:group-hover:bg-gayatri-600 md:group-hover:text-white">
            <span className="material-symbols-outlined text-[18px] md:text-[20px]">calendar_month</span>
          </span>
        </div>
      </div>
    </Link>
  )
}
