import { api } from '@/lib/api'
import { Footer, TopNav } from '@/components/site-shell'
import { getWaNumber } from '@/lib/config'
import { formatAgeRange, formatDuration, formatIdr } from '@/lib/format'
import type { ServiceDto } from '@gayatri/types'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export const revalidate = 60

const PLACEHOLDER_SERVICE: ServiceDto = {
  id: 'p1',
  slug: 'pijat-bayi-tradisional',
  name: 'Pijat Bayi Tradisional & Modern',
  description:
    'Layanan Pijat Bayi Tradisional & Modern di Gayatri Baby Spa dirancang khusus oleh tenaga terapis bersertifikat untuk memberikan stimulasi yang tepat pada saraf dan otot bayi. Kami menggabungkan teknik pijat tradisional yang lembut dengan pendekatan fisioterapi modern untuk memastikan si kecil merasa tenang, aman, dan nyaman.',
  priceIdr: 150_000,
  durationMin: 60,
  ageMinMonth: 0,
  ageMaxMonth: 24,
  imageUrl:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuDIAVXHBWSYI8gV4UYIY70Ej25IpSobujlbOA5bXLvEkcotf6WIYKuV3A--vB0AarxrD42R_aiw1OclnIVtVMKxuvU_x8O4CYS_4v-A6bFjt-tdmNwO1NNvK1NwA_GJroWo8f6IOdoZ-E6WkQzYl17ub_6zCsiLnlBaBDsV5-DoESsHe79reQ-eGwGQaj67NL8ekd_UIqZq_lwu8CaX9_KbIQJMeuYQq-dLZZbCAiAArZw6-CQt1qESm27iGsASv1VoA7IHVcskmS4',
  gallery: [
    'https://lh3.googleusercontent.com/aida-public/AB6AXuAcaTTO5KVpBBhrVJ4HVxGXJqYiqdt6Io3dZf6dnPhOi1l8kHgL_bjD-8mfxrCN3pBJFk0I3-95xdMIjaii74yy1k-5aaPqo9BaPZ-UyuKc2cUi3tnp4VdENSOHUz95U5RbsTM6S445ugKRw-ra0jGeb1nFsIsRHnd6g3AgfBi_8Sx9QhznBOV8E3_joFraDtcYU4fYR9rrxoGzFYGPgoJfybZ_MGgec5cWcY9VGnIDCm9HAtvU8SJoHi7-i03eALepXQmHL-e1YaY',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuAFj5zzSN8fxFV--Unjg_rfMHS2GCQP2dluRvmFIQlohV_T8ph6MgdJPIlOrdYfHgmfsPpgaF0it3OMDi3FqW8wfXdBqi0TnfC3hC3b_4C04xaW7SIA-zIDG41j77VVHhigNWJhzPopreifZfvitnmgDrekEzftqEW9fx9It5nJXMIrs0v92QbPrJf9j_H0p163p49py-F7lg3rbiUah6KZv27YTxA8XAHGtGfFuHxGHx6cM21PFWhxdi1KmVziXoTWm2ooSc0Uves',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuAqqilCvqI9VXqF9sAlJYOzCZ3JYjgKEhebHgY-i09n-GTkEV9tnXwz0b4zbgQKPP2bRQwogzfrqah4VMJI2cFBrF7FnhW3fSSplIVUpRjhOwiZHGcwGal5gPFiHQMsEm0cPiQaq763cenX15kSEGQ_ywl9jMz6seym7A3w78AWWMNagAM94D1sJknwN4N5mVDqXOmdRF3BzX0-a6-GhuCoX4df1wJosEsr9sgXi5i8SkL1L1OmwrB0pP_MaQCet5sRyOYeLeyrWCc'
  ],
  active: true
}

const BENEFITS = [
  {
    icon: 'bedtime',
    title: 'Tidur Lebih Lelap',
    desc: 'Membantu mengatur ritme sirkadian bayi sehingga durasi dan kualitas tidur meningkat secara signifikan.'
  },
  {
    icon: 'restaurant',
    title: 'Nafsu Makan Meningkat',
    desc: 'Stimulasi pada sistem pencernaan membantu melancarkan metabolisme dan meningkatkan nafsu makan si kecil.'
  },
  {
    icon: 'mood',
    title: 'Relaksasi Total',
    desc: 'Mengurangi hormon kortisol (stres) dan meningkatkan hormon oksitosin untuk bayi yang lebih ceria.'
  },
  {
    icon: 'fitness_center',
    title: 'Motorik Optimal',
    desc: 'Memperkuat otot dan persendian, mendukung tahapan perkembangan motorik kasar dan halus.'
  }
]

const INCLUDED = [
  'Minyak Organik Hipoalergenik',
  'Konsultasi Tumbuh Kembang',
  'Snack Sehat Pascaperawatan'
]

const TESTIMONIALS = [
  {
    name: 'Bunda Arini',
    info: 'Mama dari Baby Kenzo (6 bln)',
    body: 'Setelah pijat di sini, anak saya tidurnya pulas sekali malamnya. Biasanya terbangun tiap 2 jam, sekarang bisa 5 jam nonstop. Terima kasih Gayatri!'
  },
  {
    name: 'Bunda Maya',
    info: 'Mama dari Baby Alisa (4 bln)',
    body: 'Tempatnya sangat tenang dan wangi. Terapisnya sangat sabar menghadapi anak saya yang tadinya rewel jadi tenang saat dipijat.'
  },
  {
    name: 'Bunda Siska',
    info: 'Mama dari Arkan (8 bln)',
    body: 'Pelayanannya sangat profesional. Si kecil langsung tenang dan tidurnya jadi jauh lebih berkualitas setelah pijat di Gayatri.'
  }
]

async function getService(slug: string): Promise<ServiceDto | null> {
  try {
    return await api<ServiceDto>(`/v1/catalog/services/${slug}`)
  } catch {
    if (slug === PLACEHOLDER_SERVICE.slug) return PLACEHOLDER_SERVICE
    return null
  }
}

export default async function ServiceDetailPage({ params }: { params: { slug: string } }) {
  const service = await getService(params.slug)
  if (!service) notFound()

  const waNumber = getWaNumber()

  return (
    <>
      <TopNav active="services" />
      <main className="pb-32 lg:pb-0">
        <HeroBanner service={service} />
        <section className="mx-auto max-w-7xl px-5 py-12 md:px-20 md:py-16">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-6">
            <div className="space-y-10 lg:col-span-8 lg:space-y-12">
              <AboutBlock description={service.description} />
              <BenefitsBlock />
              {service.gallery.length > 0 && <GalleryBlock gallery={service.gallery} />}
            </div>
            <aside className="lg:col-span-4">
              <div className="space-y-6 lg:sticky lg:top-28">
                <PricingCard service={service} waNumber={waNumber} />
                <SafetyNote />
              </div>
            </aside>
          </div>
        </section>
        <TestimonialsBlock />
      </main>

      <StickyMobileCta service={service} />

      <Footer waNumber={waNumber} />
    </>
  )
}

function HeroBanner({ service }: { service: ServiceDto }) {
  return (
    <section className="relative w-full overflow-hidden">
      <div className="relative h-[420px] w-full md:h-[614px] lg:h-[716px]">
        {service.imageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={service.imageUrl} alt={service.name} className="h-full w-full object-cover" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-cream via-cream/40 to-transparent" />
        <Link
          href="/services"
          className="absolute left-5 top-5 flex h-10 w-10 items-center justify-center rounded-full bg-cream/90 text-gayatri-600 shadow-sm backdrop-blur-md md:hidden"
          aria-label="Kembali"
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </Link>
        <div className="absolute bottom-0 left-0 hidden w-full px-20 pb-12 md:block">
          <div className="mx-auto max-w-7xl">
            <div className="max-w-3xl">
              <div className="mb-4 flex items-center gap-3">
                <span className="rounded-full bg-peach-100 px-4 py-1 text-sm font-semibold tracking-wide text-charcoal-soft">
                  Best Seller
                </span>
                <span className="flex items-center text-sm font-semibold tracking-wide text-gayatri-600">
                  <span
                    className="material-symbols-outlined mr-1 text-[18px]"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    star
                  </span>
                  4.9 (120+ Ulasan)
                </span>
              </div>
              <h1 className="mb-4 font-display text-4xl font-semibold tracking-tight text-charcoal md:text-5xl md:leading-[56px]">
                {service.name}
              </h1>
              <p className="text-lg leading-7 text-charcoal-soft">
                Paduan teknik warisan leluhur dengan sentuhan medis modern untuk tumbuh kembang optimal si kecil.
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="-mt-12 px-5 pb-2 md:hidden">
        <div className="rounded-t-3xl border-t border-outline-soft/30 bg-cream p-6 shadow-sm">
          <div className="mb-4 flex flex-wrap gap-2">
            <span className="rounded-full bg-peach-100 px-4 py-1.5 text-sm font-semibold tracking-wide text-charcoal-soft">
              {formatDuration(service.durationMin)}
            </span>
            <span className="rounded-full bg-gayatri-300/40 px-4 py-1.5 text-sm font-semibold tracking-wide text-gayatri-700">
              Populer
            </span>
          </div>
          <h1 className="mb-2 font-display text-[28px] font-medium leading-9 text-gayatri-600">{service.name}</h1>
          <p className="mb-6 leading-relaxed text-charcoal-soft">{service.description}</p>
          <div className="grid grid-cols-2 gap-4 rounded-xl bg-cream-100 p-4">
            <div>
              <p className="mb-1 text-sm font-semibold uppercase tracking-wider text-charcoal-soft">Harga</p>
              <p className="text-[28px] font-bold leading-9 text-gayatri-600">{formatIdr(service.priceIdr)}</p>
            </div>
            <div className="border-l border-outline-soft/30 pl-4">
              <p className="mb-1 text-sm font-semibold uppercase tracking-wider text-charcoal-soft">Kategori</p>
              <p className="text-[22px] font-semibold leading-7 text-charcoal">
                {formatAgeRange(service.ageMinMonth, service.ageMaxMonth)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function AboutBlock({ description }: { description: string }) {
  return (
    <div className="space-y-6">
      <h2 className="font-display text-3xl font-medium leading-10 text-gayatri-600">Tentang Layanan</h2>
      <p className="text-lg leading-relaxed text-charcoal-soft">{description}</p>
    </div>
  )
}

function BenefitsBlock() {
  return (
    <div className="space-y-6">
      <h2 className="font-display text-3xl font-medium leading-10 text-gayatri-600">Manfaat Utama</h2>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {BENEFITS.map((b) => (
          <div key={b.title} className="rounded-xl border border-outline-soft/30 bg-white p-6 shadow-glow md:p-8">
            <span className="material-symbols-outlined mb-4 text-4xl text-gayatri-600">{b.icon}</span>
            <h3 className="mb-2 text-[22px] font-semibold leading-7 text-charcoal">{b.title}</h3>
            <p className="text-base text-charcoal-soft">{b.desc}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

function GalleryBlock({ gallery }: { gallery: string[] }) {
  return (
    <div className="space-y-6">
      <h2 className="font-display text-3xl font-medium leading-10 text-gayatri-600">Suasana Perawatan</h2>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        {gallery.slice(0, 6).map((src, i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img key={i} src={src} alt={`Galeri ${i + 1}`} className="h-48 w-full rounded-xl object-cover md:h-64" />
        ))}
      </div>
    </div>
  )
}

function PricingCard({ service, waNumber }: { service: ServiceDto; waNumber: string }) {
  return (
    <div className="hidden rounded-2xl border border-outline-soft/30 bg-white p-8 shadow-glow lg:block">
      <div className="space-y-6">
        <div>
          <h3 className="mb-1 text-[22px] font-semibold leading-7 text-charcoal">Rincian Layanan</h3>
          <p className="text-base text-charcoal-soft">Sesi privat dengan terapis ahli.</p>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between border-b border-outline-soft/20 py-3">
            <div className="flex items-center text-charcoal-soft">
              <span className="material-symbols-outlined mr-2">schedule</span>
              <span className="text-base">Durasi</span>
            </div>
            <span className="rounded-full bg-peach-100/60 px-3 py-1 text-sm font-semibold tracking-wide text-charcoal-soft">
              {formatDuration(service.durationMin)}
            </span>
          </div>
          <div className="flex items-center justify-between border-b border-outline-soft/20 py-3">
            <div className="flex items-center text-charcoal-soft">
              <span className="material-symbols-outlined mr-2">child_care</span>
              <span className="text-base">Usia</span>
            </div>
            <span className="text-base font-semibold text-charcoal">
              {formatAgeRange(service.ageMinMonth, service.ageMaxMonth)}
            </span>
          </div>
          <div className="flex items-center justify-between py-3">
            <div className="flex items-center text-charcoal-soft">
              <span className="material-symbols-outlined mr-2">payments</span>
              <span className="text-base">Harga</span>
            </div>
            <span className="text-[22px] font-semibold leading-7 text-gayatri-600">{formatIdr(service.priceIdr)}</span>
          </div>
        </div>
        <div className="rounded-xl bg-cream-100 p-4">
          <h4 className="mb-2 flex items-center text-sm font-semibold tracking-wide text-gayatri-600">
            <span className="material-symbols-outlined mr-2 text-[18px]">info</span>
            Termasuk:
          </h4>
          <ul className="space-y-2 text-base text-charcoal-soft">
            {INCLUDED.map((item) => (
              <li key={item} className="flex items-center">
                <span className="material-symbols-outlined mr-2 text-[16px] text-gayatri-600">check_circle</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
        <Link
          href={`/checkout?service=${service.slug}`}
          className="block rounded-full bg-gayatri-600 py-4 text-center text-[22px] font-semibold leading-7 text-white transition-all hover:opacity-90 active:scale-95"
        >
          Pesan Layanan Ini
        </Link>
        <p className="text-center text-xs text-charcoal-soft">
          Butuh bantuan?{' '}
          <a
            href={`https://wa.me/${waNumber}`}
            target="_blank"
            rel="noreferrer"
            className="text-gayatri-600 underline"
          >
            Hubungi via WhatsApp
          </a>
        </p>
      </div>
    </div>
  )
}

function SafetyNote() {
  return (
    <div className="hidden rounded-2xl border border-gayatri-600/10 bg-gayatri-50 p-6 lg:block">
      <div className="flex items-start">
        <span className="material-symbols-outlined mr-3 mt-0.5 text-gayatri-600">verified_user</span>
        <div>
          <h4 className="mb-1 text-sm font-semibold tracking-wide text-gayatri-600">Jaminan Keamanan</h4>
          <p className="text-xs text-charcoal-soft">
            Seluruh terapis kami telah divaksinasi dan mengikuti protokol kesehatan ketat untuk keamanan buah hati
            Anda.
          </p>
        </div>
      </div>
    </div>
  )
}

function TestimonialsBlock() {
  return (
    <section className="bg-cream-100 py-16">
      <div className="mx-auto max-w-7xl px-5 text-center md:px-20">
        <h2 className="mb-12 font-display text-[28px] font-medium leading-9 text-gayatri-600 md:text-3xl md:leading-10">
          Apa Kata Bunda?
        </h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-8">
          {TESTIMONIALS.map((t) => (
            <div key={t.name} className="rounded-2xl bg-white p-8 text-left shadow-glow">
              <div className="mb-4 flex text-gayatri-600">
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
              <div className="flex items-center">
                <div className="mr-3 h-10 w-10 rounded-full bg-peach-100" />
                <div>
                  <p className="text-sm font-semibold tracking-wide text-charcoal">{t.name}</p>
                  <p className="text-xs text-charcoal-soft">{t.info}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function StickyMobileCta({ service }: { service: ServiceDto }) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t border-outline-soft/30 bg-cream px-5 py-4 shadow-glow-md lg:hidden">
      <div className="mb-1 flex items-center justify-between text-charcoal-soft">
        <span className="text-xs uppercase tracking-wider">Mulai dari</span>
        <span className="text-lg font-bold text-gayatri-600">{formatIdr(service.priceIdr)}</span>
      </div>
      <Link
        href={`/checkout?service=${service.slug}`}
        className="flex w-full items-center justify-center gap-3 rounded-xl bg-gayatri-600 py-4 text-sm font-semibold tracking-wide text-white shadow-glow transition-transform duration-200 active:scale-95"
      >
        <span className="material-symbols-outlined">calendar_month</span>
        Pesan Layanan Ini
      </Link>
    </div>
  )
}
