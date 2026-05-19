import { api } from '@/lib/api'
import { Footer, TopNav, WaFloating } from '@/components/site-shell'
import { ProductBannerSlider } from '@/components/product-banner-slider'
import { HeroImageSlider } from '@/components/hero-image-slider'
import { getWaNumber } from '@/lib/config'
import { formatDuration } from '@/lib/format'
import type { ServiceDto, BannerDto, ProductDto } from '@gayatri/types'
import Link from 'next/link'

export const revalidate = 60

const HERO_IMAGE = 'https://picsum.photos/seed/gayatri-hero/1200/600'

const ABOUT_IMG_1 =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuAbEUJxZ1YW3FmMNIJ3h_LFn2Z1Adb-iKPASMBzeTYCzL_0OZLMBZn5oXA9EMiTqm-vwGZCpY8XSTOgscaBzeQqWL19cSaHNy9jZq11PxwfsTbEJkVEkwZTsNl_4y_P0hDJYJkb-yM0RD8wTr8h2dia2nHM-Qr2M7ySPpk5jXysesU-A0pewXgmyj99JWkfEEyZEnyVKaqJ8vR90uwAbpQNtih61geYP9Ku50LZgAXi5GG5VsijUxguGYOcUxjFxVUHfHkKsw68_AM'

const ABOUT_IMG_2 =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuAOoUYyNZbrrulISO-j0Nx8LMZV6YFGrA6UJUQi24hgoE_9TMcDEG2PjbxGUON2F_xGT1rXpaQU-FfRedUkVPk-9qGq-2cokgoUw9UTx9hhjn9Jyjx4ChNXdKHRmMO3jSzD5QQNfxtgWnGTcV9ky90N2Htj_nzf_Y-KOMsVXzCgdgX7Qy-5WdzOPd9CZ2QXFWFxxRW2gR9z8CnEL_smzizwATPbwyAHb6O8FPmsZ5JDogfKZa77lJzhMOfoU2dCoeVjXdcMUaII4_0'

const PLACEHOLDER_PRODUCTS: ProductDto[] = [
  {
    id: 'pr1',
    slug: 'baby-massage-oil',
    name: 'Baby Massage Oil Organik',
    description: 'Minyak pijat bayi dari bahan alami pilihan, lembut di kulit sensitif si kecil dan membantu relaksasi otot.',
    priceIdr: 85000,
    stock: 50,
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB9P0Wjrwv0on_8E651xxOLyMjRNT3bplKWT5PR5nC3aThMVlGt5C3ac43as_mlMvWkEqB1wOBDNahC8PABxmL7QR_KagFcmF9xcLUf2sse2aGNybRziaPgi6my6o18n02OUriXlkZMtpCT-QwbVhhFYMV0hX3BMNHhYJIeJoDqolo5cM6V35HnSB3-DVSBb-V4TbGOlsXWPeJ5Y-K6iu-aR3NJPrxxRI8QJsYEnBehCbJgFlzfFZYKbmLnyXWpfs-XjYW5HfemwUg',
    categoryId: 'cat1',
    active: true
  },
  {
    id: 'pr2',
    slug: 'gentle-baby-wash',
    name: 'Gentle Baby Wash & Shampoo',
    description: 'Formula no-tears dengan ekstrak chamomile dan calendula. Membersihkan dengan lembut tanpa mengiritasi kulit.',
    priceIdr: 95000,
    stock: 40,
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBy7_9MoIGD99-aYY8-elaNGhdmrD3LiK4cpU5l-lWxZsiPzQC_-WWLwtVXtLh0-JybmU1R0jwgRPH_JIhduNLdu5w3Tgz6bAJfyeTMjaEwi7kIVW7J51-WdRSOmmRjwwjV5MXu4bd-STySRKAubkCPP8YyUtZSg5i2-pHPg61HgtTy2Xe9mBDR6AcKnhf0FIq_GkvHL6utQwmlZfp8dzd4ig0re0r_vEGK_7as92gSzB85mP_EYyEAmmvQ4_fxTeLb1JHPtNsK8oc',
    categoryId: 'cat1',
    active: true
  },
  {
    id: 'pr3',
    slug: 'baby-lotion-premium',
    name: 'Baby Lotion Premium Organic',
    description: 'Pelembab kulit bayi diperkaya dengan shea butter dan vitamin E. Menjaga kelembaban sepanjang hari.',
    priceIdr: 110000,
    stock: 35,
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAKpE6etZEL6bPXM_8Mj2wjMBp5CqGMMFUhvKDzmUVNUFoBfSYHKY4dl01TyoiLR8_zXV0ks3GG1HP2Wqk9eqbMdM7AyXXm44KA1lCqQoEVa6kKQ7Z1iFZ2or1gz-jaViv9u72sAUDKFAsfyWqJ3qOfjB1kaR4YqQ13VYvOM00YRlD-zyZUKBhrJUiGyg-JB46QgyQcaHMOA1sG999E2C5MjmahXLzv0y510q7t0n2UvCX_4QsfrGML9yLZbv29QA-vaVoaBAYRvGY',
    categoryId: 'cat1',
    active: true
  }
]

const PLACEHOLDER_SERVICES: ServiceDto[] = [
  {
    id: 'p1',
    slug: 'pijat-bayi',
    name: 'Pijat Bayi (Baby Massage)',
    description: 'Relaksasi otot dan stimulasi saraf untuk meningkatkan kualitas tidur bayi Anda.',
    priceIdr: 0,
    durationMin: 45,
    ageMinMonth: 1,
    ageMaxMonth: 24,
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAKpE6etZEL6bPXM_8Mj2wjMBp5CqGMMFUhvKDzmUVNUFoBfSYHKY4dl01TyoiLR8_zXV0ks3GG1HP2Wqk9eqbMdM7AyXXm44KA1lCqQoEVa6kKQ7Z1iFZ2or1gz-jaViv9u72sAUDKFAsfyWqJ3qOfjB1kaR4YqQ13VYvOM00YRlD-zyZUKBhrJUiGyg-JB46QgyQcaHMOA1sG999E2C5MjmahXLzv0y510q7t0n2UvCX_4QsfrGML9yLZbv29QA-vaVoaBAYRvGY',
    gallery: [],
    active: true
  },
  {
    id: 'p2',
    slug: 'baby-swim',
    name: 'Berenang Bayi (Baby Swim)',
    description: 'Membantu melatih motorik kasar dan melancarkan sirkulasi darah si kecil.',
    priceIdr: 0,
    durationMin: 30,
    ageMinMonth: 3,
    ageMaxMonth: 24,
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuD4MGX_hwl-WkjWxOtsYiq_xdAuQJ1S0Gj1t6-SllZaM19TbK5FSFRrsTMEiVCS33r3iezU4YhJ1kEwPp50lrcl3wVU5frmeEcBYAFlOlntOZC-BuNj29Gpyr1vGSDyWrNSVhI3Mvf2FTbPexJ_EUqsRaHhetv0ST38U39t_QBjOO-CSyAt67uxl2SVB2Nb1AW1711otUjvYO8fwU2M6fzZk0lspWgYfJLhbpueCu8EzslUzaQqbJsJjup_6oA3-b4BC_kmpOqNdn4',
    gallery: [],
    active: true
  },
  {
    id: 'p3',
    slug: 'perawatan-kulit-organik',
    name: 'Perawatan Kulit Organik',
    description: 'Menggunakan bahan-bahan alami terbaik untuk menjaga kelembutan kulit sensitif.',
    priceIdr: 0,
    durationMin: 60,
    ageMinMonth: 0,
    ageMaxMonth: 36,
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBy7_9MoIGD99-aYY8-elaNGhdmrD3LiK4cpU5l-lWxZsiPzQC_-WWLwtVXtLh0-JybmU1R0jwgRPH_JIhduNLdu5w3Tgz6bAJfyeTMjaEwi7kIVW7J51-WdRSOmmRjwwjV5MXu4bd-STySRKAubkCPP8YyUtZSg5i2-pHPg61HgtTy2Xe9mBDR6AcKnhf0FIq_GkvHL6utQwmlZfp8dzd4ig0re0r_vEGK_7as92gSzB85mP_EYyEAmmvQ4_fxTeLb1JHPtNsK8oc',
    gallery: [],
    active: true
  }
]

const TESTIMONIALS = [
  {
    name: 'Bunda Arini',
    childInfo: 'Ibu dari Alif (6 bulan)',
    body: 'Pertama kali ke Gayatri langsung jatuh cinta sama suasananya. Sangat tenang dan bersih. Anak saya yang biasanya rewel, di sini malah ketawa-ketawa pas dipijat.'
  },
  {
    name: 'Bunda Clarissa',
    childInfo: 'Ibu dari Maya (8 bulan)',
    body: 'Layanan baby swim-nya luar biasa. Instrukturnya sabar banget nanganin bayi yang takut air. Sekarang si kecil malah hobi berenang tiap minggu!'
  },
  {
    name: 'Bunda Dian',
    childInfo: 'Ibu dari Kenzo (4 bulan)',
    body: 'Saya sangat memperhatikan kebersihan produk yang dipakai untuk bayi. Di Gayatri mereka pakai organic oil yang wangi dan lembut banget di kulit.'
  }
]

async function getData() {
  const [banners, services, products] = await Promise.all([
    api<BannerDto[]>('/v1/catalog/banners').catch(() => [] as BannerDto[]),
    api<ServiceDto[]>('/v1/catalog/services').catch(() => [] as ServiceDto[]),
    api<ProductDto[]>('/v1/catalog/products').catch(() => [] as ProductDto[])
  ])
  return { banners, services, products }
}

export default async function HomePage() {
  const { banners, services, products } = await getData()
  const displayedServices = services.length > 0 ? services.slice(0, 3) : PLACEHOLDER_SERVICES
  const displayedProducts = products.length > 0 ? products : PLACEHOLDER_PRODUCTS
  const heroImages = banners.length > 0 ? banners.map((b) => b.imageUrl) : [HERO_IMAGE]
  const waNumber = getWaNumber()

  return (
    <>
      <TopNav active="home" />
      <main>
        <HeroSection images={heroImages} />
        <ProductBannerSlider products={displayedProducts} />
        <ServicesSection services={displayedServices} />
        <AboutSection />
        <TestimonialsSection />
        <CtaSection />
      </main>
      <Footer waNumber={waNumber} />
      <WaFloating waNumber={waNumber} />
    </>
  )
}

function HeroSection({ images }: { images: string[] }) {
  return (
    <section className="relative overflow-hidden px-5 py-12 md:px-20 md:py-24">
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 md:grid-cols-2">
        <div className="order-1 md:order-none">
          <HeroImageSlider images={images} />
        </div>
        <div className="order-2 z-10 text-center md:order-none md:text-left">
          <span className="mb-6 inline-block rounded-full bg-peach-100 px-4 py-1.5 text-sm font-semibold tracking-wide text-charcoal-soft">
            Premium Wellness for Infants
          </span>
          <h1 className="mb-6 font-display text-4xl font-semibold tracking-tight text-charcoal md:text-5xl md:leading-[56px]">
            Sentuhan Lembut untuk Si Kecil
          </h1>
          <p className="mx-auto mb-10 max-w-lg text-lg leading-7 text-charcoal-soft md:mx-0">
            Layanan spa bayi profesional dengan kasih sayang. Ciptakan momen ketenangan dan kesehatan optimal bagi
            buah hati Anda di Gayatri.
          </p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row md:justify-start">
            <Link
              href="/services"
              className="rounded-full bg-gayatri-600 px-8 py-4 text-center text-sm font-semibold tracking-wide text-white shadow-lg transition-all hover:shadow-xl"
            >
              Pesan Sekarang
            </Link>
            <Link
              href="/services"
              className="rounded-full border border-gayatri-600 px-8 py-4 text-center text-sm font-semibold tracking-wide text-gayatri-600 transition-all hover:bg-gayatri-50"
            >
              Lihat Menu Spa
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}


function ServicesSection({ services }: { services: ServiceDto[] }) {
  return (
    <section className="bg-cream-100 px-5 py-16 md:px-20">
      <div className="mx-auto max-w-7xl">
        <div className="mb-16 text-center">
          <h2 className="mb-4 font-display text-[28px] font-medium leading-9 text-gayatri-600 md:text-3xl md:leading-10">
            Layanan Unggulan Kami
          </h2>
          <p className="mx-auto max-w-2xl text-base text-charcoal-soft">
            Dirancang khusus untuk mendukung tumbuh kembang dan relaksasi buah hati Anda melalui metode yang aman dan
            teruji.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {services.map((s) => (
            <Link
              key={s.id}
              href={`/services/${s.slug}`}
              className="group block rounded-[1.5rem] border border-outline-soft/30 bg-cream p-6 shadow-glow transition-transform duration-300 hover:-translate-y-2"
            >
              <div className="mb-6 aspect-[4/3] w-full overflow-hidden rounded-xl">
                {s.imageUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={s.imageUrl} alt={s.name} className="h-full w-full object-cover" />
                )}
              </div>
              <div className="mb-4 flex items-start justify-between gap-3">
                <h3 className="text-[22px] font-semibold leading-7 text-charcoal">{s.name}</h3>
                <span className="shrink-0 rounded-full bg-peach-100 px-3 py-1 text-xs text-charcoal-soft">
                  {formatDuration(s.durationMin)}
                </span>
              </div>
              <p className="mb-6 text-base text-charcoal-soft">{s.description}</p>
              <span className="flex items-center gap-2 text-sm font-semibold tracking-wide text-gayatri-600">
                Selengkapnya
                <span className="material-symbols-outlined text-sm transition-transform group-hover:translate-x-1">
                  arrow_forward
                </span>
              </span>
            </Link>
          ))}
        </div>
        <div className="mt-10 text-center">
          <Link
            href="/services"
            className="inline-flex items-center gap-2 rounded-full border border-gayatri-600 px-8 py-3 text-sm font-semibold tracking-wide text-gayatri-600 transition-all hover:bg-gayatri-600 hover:text-white active:scale-95"
          >
            Lihat Semua Layanan
            <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </Link>
        </div>
      </div>
    </section>
  )
}

function AboutSection() {
  const points = [
    'Terapis bersertifikat dan berpengalaman',
    'Lingkungan steril dan higienis',
    'Produk organik premium yang aman untuk kulit'
  ]
  return (
    <section className="px-5 py-16 md:px-20">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-16 md:flex-row">
        <div className="order-2 w-full md:order-1 md:w-1/2">
          <div className="grid grid-cols-2 gap-4">
            <div className="aspect-[3/4] overflow-hidden rounded-2xl shadow-md">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={ABOUT_IMG_1} alt="Interior Gayatri Baby Spa" className="h-full w-full object-cover" />
            </div>
            <div className="mt-12 aspect-[3/4] overflow-hidden rounded-2xl shadow-md">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={ABOUT_IMG_2} alt="Terapis Gayatri bersama bunda dan bayi" className="h-full w-full object-cover" />
            </div>
          </div>
        </div>
        <div className="order-1 w-full md:order-2 md:w-1/2">
          <h2 className="mb-6 font-display text-[28px] font-medium leading-9 text-gayatri-600 md:text-3xl md:leading-10">
            Filosofi Gayatri
          </h2>
          <p className="mb-6 text-lg leading-7 text-charcoal">
            Nama &ldquo;Gayatri&rdquo; melambangkan kemurnian dan perlindungan. Kami percaya bahwa setiap bayi berhak
            mendapatkan awal yang paling tenang dan penuh kasih.
          </p>
          <p className="mb-8 text-base text-charcoal-soft">
            Di Gayatri Baby Spa, kami memadukan teknik spa modern dengan pendekatan personal yang mengutamakan
            kenyamanan bayi dan ketenangan pikiran orang tua. Setiap sesi di Gayatri bukan sekadar prosedur, melainkan
            perjalanan ikatan (bonding) antara ibu dan buah hati.
          </p>
          <ul className="mb-10 space-y-4">
            {points.map((p) => (
              <li key={p} className="flex items-center gap-3 text-base text-charcoal">
                <span className="material-symbols-outlined text-xl text-gayatri-600">check_circle</span>
                {p}
              </li>
            ))}
          </ul>
          <Link
            href="/about"
            className="inline-block rounded-full bg-gayatri-600 px-8 py-3 text-sm font-semibold tracking-wide text-white transition-all hover:opacity-90"
          >
            Pelajari Lebih Lanjut
          </Link>
        </div>
      </div>
    </section>
  )
}

function TestimonialsSection() {
  return (
    <section className="bg-peach-100/40 px-5 py-16 md:px-20">
      <div className="mx-auto max-w-7xl text-center">
        <h2 className="mb-12 font-display text-[28px] font-medium leading-9 text-charcoal-soft md:text-3xl md:leading-10">
          Kisah dari Para Ibu
        </h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {TESTIMONIALS.map((t) => (
            <div key={t.name} className="relative rounded-[2rem] bg-white p-8 text-left shadow-sm">
              <span className="material-symbols-outlined pointer-events-none absolute right-8 top-4 select-none text-6xl text-peach-500/40">
                format_quote
              </span>
              <div className="mb-4 flex items-center gap-1 text-gayatri-600">
                {Array.from({ length: 5 }).map((_, i) => (
                  <span
                    key={i}
                    className="material-symbols-outlined"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    star
                  </span>
                ))}
              </div>
              <p className="mb-6 text-base italic text-charcoal-soft">&ldquo;{t.body}&rdquo;</p>
              <div>
                <p className="text-sm font-semibold tracking-wide text-charcoal">{t.name}</p>
                <p className="text-xs text-charcoal-soft">{t.childInfo}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function CtaSection() {
  return (
    <section className="px-5 py-16 md:px-20">
      <div className="relative mx-auto max-w-4xl overflow-hidden rounded-[2.5rem] bg-gayatri-600 p-12 text-center text-white">
        <div className="relative z-10">
          <h2 className="mb-6 font-display text-[28px] font-medium leading-9 md:text-3xl md:leading-10">
            Berikan yang Terbaik untuk Masa Kecilnya
          </h2>
          <p className="mb-10 text-lg leading-7 opacity-90">
            Kunjungi Gayatri Baby Spa dan rasakan keajaiban sentuhan lembut yang akan membantu pertumbuhan si kecil
            lebih optimal.
          </p>
          <Link
            href="/services"
            className="inline-block rounded-full bg-cream px-10 py-4 text-sm font-semibold tracking-wide text-gayatri-600 shadow-lg transition-all hover:bg-cream-100 active:scale-95"
          >
            Jadwalkan Kunjungan
          </Link>
        </div>
        <div className="absolute left-0 top-0 -z-0 h-64 w-64 rounded-full bg-gayatri-500 opacity-20 blur-[100px]" />
        <div className="absolute bottom-0 right-0 -z-0 h-64 w-64 rounded-full bg-peach-100 opacity-30 blur-[100px]" />
      </div>
    </section>
  )
}

