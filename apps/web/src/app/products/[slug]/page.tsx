import { api } from '@/lib/api'
import { Footer, TopNav, WaFloating } from '@/components/site-shell'
import { getWaNumber } from '@/lib/config'
import { formatIdr } from '@/lib/format'
import type { ProductDto } from '@gayatri/types'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export const revalidate = 60

type ProductWithCategory = ProductDto & { categoryName: string }

const CATEGORY_MAP: Record<string, string> = {
  'minyak-serum': 'Minyak & Serum',
  'perlengkapan-mandi': 'Perlengkapan Mandi',
  'paket-spesial': 'Paket Spesial',
  'aksesoris': 'Aksesoris'
}

const PLACEHOLDER_PRODUCTS: ProductWithCategory[] = [
  {
    id: 'p1',
    slug: 'minyak-pijat-lavender',
    name: 'Minyak Pijat Bayi Lavender',
    description:
      'Minyak pijat organik dengan ekstrak lavender asli yang diformulasikan khusus untuk kulit bayi yang sensitif. Diperkaya vitamin E dan chamomile extract untuk menjaga kelembapan kulit dan memberikan aroma menenangkan yang membantu bayi tidur lebih lelap.',
    priceIdr: 75_000,
    stock: 24,
    imageUrl: null,
    categoryId: 'minyak-serum',
    categoryName: 'Minyak & Serum',
    active: true
  },
  {
    id: 'p2',
    slug: 'minyak-telon-premium',
    name: 'Minyak Telon Premium Organik',
    description:
      'Formula organik tradisional dari adas, kelapa murni, dan kayu putih pilihan untuk menghangatkan dan melindungi perut bayi dari kembung dan kolik. Tanpa bahan kimia berbahaya, aman untuk bayi baru lahir.',
    priceIdr: 65_000,
    stock: 18,
    imageUrl: null,
    categoryId: 'minyak-serum',
    categoryName: 'Minyak & Serum',
    active: true
  },
  {
    id: 'p3',
    slug: 'handuk-bayi-organik',
    name: 'Handuk Bayi Organik Bamboo',
    description:
      'Handuk ultra-lembut dari serat bambu organik bersertifikat GOTS. Hipoalergenik, anti-bakteri alami, dan cepat menyerap air. Ukuran 70x140 cm cocok untuk bayi hingga balita.',
    priceIdr: 120_000,
    stock: 12,
    imageUrl: null,
    categoryId: 'perlengkapan-mandi',
    categoryName: 'Perlengkapan Mandi',
    active: true
  },
  {
    id: 'p4',
    slug: 'sabun-lotion-set',
    name: 'Sabun & Lotion Bayi Set',
    description:
      'Paket sabun cair dan lotion berpasangan dengan kandungan aloe vera organik dan chamomile extract. Formula no-tear, pH balance, dan telah diuji dermatologis untuk menjaga kelembapan kulit bayi sepanjang hari.',
    priceIdr: 95_000,
    stock: 8,
    imageUrl: null,
    categoryId: 'perlengkapan-mandi',
    categoryName: 'Perlengkapan Mandi',
    active: true
  },
  {
    id: 'p5',
    slug: 'paket-gift-box-newborn',
    name: 'Gift Box Newborn Gayatri',
    description:
      'Paket hadiah premium untuk bayi baru lahir dalam kemasan kotak cantik berlabel Gayatri. Isi: minyak pijat lavender, lotion bayi, handuk bamboo mini, dan kartu ucapan eksklusif bertulisan tangan.',
    priceIdr: 250_000,
    stock: 5,
    imageUrl: null,
    categoryId: 'paket-spesial',
    categoryName: 'Paket Spesial',
    active: true
  },
  {
    id: 'p6',
    slug: 'bando-bayi-premium',
    name: 'Bando Bayi Premium',
    description:
      'Koleksi bando bayi dari bahan katun lembut 100% organik dengan berbagai motif floral dan polos. Elastis lembut, tidak menekan kepala, aman untuk bayi baru lahir hingga usia 2 tahun.',
    priceIdr: 45_000,
    stock: 30,
    imageUrl: null,
    categoryId: 'aksesoris',
    categoryName: 'Aksesoris',
    active: true
  }
]

type ProductDetail = {
  benefits: { icon: string; title: string; desc: string }[]
  usage: string
  ingredients?: string
}

const PRODUCT_DETAILS: Record<string, ProductDetail> = {
  'minyak-pijat-lavender': {
    benefits: [
      { icon: 'bedtime', title: 'Tidur Lebih Lelap', desc: 'Aroma lavender menenangkan sistem saraf bayi untuk kualitas tidur yang lebih baik.' },
      { icon: 'spa', title: 'Kulit Lembut & Lembap', desc: 'Vitamin E dan sweet almond oil menutrisi dan menjaga kelembapan kulit sepanjang malam.' },
      { icon: 'mood', title: 'Mengurangi Rewel', desc: 'Sentuhan pijat + aroma lavender menurunkan kadar kortisol dan membuat bayi lebih tenang.' },
      { icon: 'verified_user', title: 'Aman Kulit Sensitif', desc: 'Formula hipoalergenik, bebas paraben, SLS, dan pewarna buatan.' }
    ],
    usage:
      'Tuang 3–5 tetes di telapak tangan, hangatkan sejenak dengan menggesek kedua telapak. Aplikasikan dengan pijatan lembut memutar di tubuh bayi. Gunakan setelah mandi sore atau sebelum tidur malam untuk hasil optimal.',
    ingredients: 'Sweet Almond Oil, Lavender Essential Oil (2%), Vitamin E, Chamomile Extract, Jojoba Oil'
  },
  'minyak-telon-premium': {
    benefits: [
      { icon: 'thermostat', title: 'Menghangatkan', desc: 'Kayu putih dan adas memberikan kehangatan lembut untuk perut dan dada bayi.' },
      { icon: 'restaurant', title: 'Atasi Kembung', desc: 'Formula tradisional terbukti membantu mengurangi kolik dan perut kembung.' },
      { icon: 'air', title: 'Anti Nyamuk Alami', desc: 'Kandungan sereh alami mengusir nyamuk tanpa bahan kimia berbahaya.' },
      { icon: 'eco', title: '100% Organik', desc: 'Bahan dari pertanian organik bersertifikat, bebas pestisida dan kimia sintetis.' }
    ],
    usage:
      'Oleskan tipis-tipis di perut, punggung, dan dada bayi 2–3 kali sehari atau saat bayi terlihat tidak nyaman. Hindari area wajah dan selaput lendir.',
    ingredients: 'Coconut Oil, Eucalyptus Essential Oil, Fennel Oil, Citronella Oil'
  },
  'handuk-bayi-organik': {
    benefits: [
      { icon: 'water_drop', title: 'Ultra Menyerap', desc: 'Serat bambu 3x lebih menyerap dari kapas biasa, cocok untuk kulit bayi yang mudah teriritasi.' },
      { icon: 'eco', title: 'Organik Bersertifikat', desc: 'GOTS certified — bebas bahan kimia berbahaya dari bahan baku hingga produk jadi.' },
      { icon: 'verified_user', title: 'Anti Bakteri Alami', desc: 'Bambu secara alami mengandung agen anti-bakteri tanpa perlu perawatan kimia.' },
      { icon: 'wash', title: 'Tahan Lama', desc: 'Tidak berbulu dan tetap lembut setelah dicuci berulang kali.' }
    ],
    usage: 'Cuci sebelum pertama kali digunakan. Gunakan deterjen lembut tanpa pelicin. Keringkan di bawah angin atau mesin pengering suhu rendah.',
    ingredients: '100% Organic Bamboo Fiber (GOTS Certified), ukuran 70×140 cm'
  },
  'sabun-lotion-set': {
    benefits: [
      { icon: 'bubble_chart', title: 'Formula No-Tear', desc: 'Sabun lembut tanpa efek pedih di mata, aman untuk waktu mandi yang menyenangkan.' },
      { icon: 'spa', title: 'pH Balance', desc: 'pH 5.5 sesuai dengan pH alami kulit bayi untuk perlindungan optimal.' },
      { icon: 'water_drop', title: 'Lembap 24 Jam', desc: 'Lotion dengan aloe vera mengunci kelembapan kulit sepanjang hari.' },
      { icon: 'science', title: 'Uji Dermatologis', desc: 'Telah diuji oleh dermatologis anak dan terbukti aman untuk kulit sensitif.' }
    ],
    usage:
      'Sabun: tuang secukupnya, buat busa, aplikasikan merata, bilas bersih. Lotion: aplikasikan segera setelah mandi pada kulit yang masih sedikit lembap untuk hasil terbaik.',
    ingredients: 'Sabun: Aqua, Cocamidopropyl Betaine, Aloe Vera, Chamomile Extract. Lotion: Aqua, Aloe Vera Gel, Glycerin, Vitamin E'
  },
  'paket-gift-box-newborn': {
    benefits: [
      { icon: 'card_giftcard', title: 'Kemasan Premium', desc: 'Kotak hadiah eksklusif berlabel Gayatri, siap diberikan tanpa perlu dibungkus ulang.' },
      { icon: 'spa', title: 'Produk Pilihan Terapis', desc: 'Semua produk di dalam paket adalah yang digunakan dan direkomendasikan terapis Gayatri.' },
      { icon: 'child_care', title: 'Aman Newborn', desc: 'Semua produk diformulasikan dan aman untuk bayi baru lahir.' },
      { icon: 'edit_note', title: 'Kartu Ucapan Personal', desc: 'Sertakan pesan personal yang akan ditulis tangan oleh tim kami.' }
    ],
    usage: 'Isi: 1 Minyak Pijat Lavender (50ml), 1 Lotion Bayi (100ml), 1 Handuk Bamboo Mini (40×40cm), 1 Kartu Ucapan. Hubungi kami untuk personalisasi pesan.',
  },
  'bando-bayi-premium': {
    benefits: [
      { icon: 'child_care', title: 'Aman Bayi Baru Lahir', desc: 'Elastis sangat lembut, tidak menekan kepala bayi yang masih berkembang.' },
      { icon: 'eco', title: 'Katun Organik', desc: '100% katun organik bersertifikat, bebas zat warna berbahaya.' },
      { icon: 'palette', title: 'Berbagai Motif', desc: 'Tersedia dalam motif floral, polkadot, dan polos dalam pilihan warna pastel.' },
      { icon: 'wash', title: 'Mudah Dicuci', desc: 'Bisa dicuci mesin, tidak luntur, tidak melar.' }
    ],
    usage: 'Cocok untuk bayi 0–24 bulan. Tersedia dalam beberapa ukuran elastis. Cuci dengan deterjen lembut, hindari pemutih.',
    ingredients: '100% Organic Cotton, Elastane 5%'
  }
}

async function getProduct(slug: string): Promise<ProductWithCategory | null> {
  try {
    const p = await api<ProductDto>(`/v1/catalog/products/${slug}`)
    return { ...p, categoryName: CATEGORY_MAP[p.categoryId] ?? p.categoryId }
  } catch {
    return PLACEHOLDER_PRODUCTS.find((p) => p.slug === slug) ?? null
  }
}

export default async function ProductDetailPage({ params }: { params: { slug: string } }) {
  const product = await getProduct(params.slug)
  if (!product) notFound()

  const waNumber = getWaNumber()
  const detail = PRODUCT_DETAILS[product.slug]

  return (
    <>
      <TopNav active="products" />
      <main className="pb-32 lg:pb-0">
        <HeroBanner product={product} />
        <section className="mx-auto max-w-7xl px-5 py-12 md:px-20 md:py-16">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-6">
            <div className="space-y-10 lg:col-span-8 lg:space-y-12">
              <AboutBlock product={product} />
              {detail && <BenefitsBlock benefits={detail.benefits} />}
              {detail && <UsageBlock usage={detail.usage} ingredients={detail.ingredients} />}
            </div>
            <aside className="lg:col-span-4">
              <div className="space-y-6 lg:sticky lg:top-28">
                <PurchaseCard product={product} waNumber={waNumber} />
              </div>
            </aside>
          </div>
        </section>
      </main>

      <StickyMobileCta product={product} waNumber={waNumber} />
      <Footer waNumber={waNumber} />
      <WaFloating waNumber={waNumber} />
    </>
  )
}

function HeroBanner({ product }: { product: ProductWithCategory }) {
  return (
    <section className="relative w-full overflow-hidden">
      <div className="relative h-[320px] w-full md:h-[480px] lg:h-[560px]">
        {product.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-gayatri-50 via-cream to-peach-100">
            <span className="material-symbols-outlined text-[120px] text-gayatri-300 md:text-[180px]">spa</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-cream via-cream/20 to-transparent" />
        <Link
          href="/products"
          className="absolute left-5 top-5 flex h-10 w-10 items-center justify-center rounded-full bg-cream/90 text-gayatri-600 shadow-sm backdrop-blur-md md:hidden"
          aria-label="Kembali"
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </Link>
        <div className="absolute bottom-0 left-0 hidden w-full px-20 pb-12 md:block">
          <div className="mx-auto max-w-7xl">
            <div className="max-w-2xl">
              <div className="mb-4 flex items-center gap-3">
                <span className="rounded-full bg-peach-100 px-4 py-1 text-sm font-semibold tracking-wide text-charcoal-soft">
                  {product.categoryName}
                </span>
                {product.stock <= 5 && product.stock > 0 && (
                  <span className="flex items-center text-sm font-semibold tracking-wide text-amber-600">
                    <span className="material-symbols-outlined mr-1 text-[18px]">warning</span>
                    Sisa {product.stock}
                  </span>
                )}
              </div>
              <h1 className="mb-4 font-display text-4xl font-semibold tracking-tight text-charcoal md:text-5xl md:leading-[56px]">
                {product.name}
              </h1>
            </div>
          </div>
        </div>
      </div>

      <div className="-mt-12 px-5 pb-2 md:hidden">
        <div className="rounded-t-3xl border-t border-outline-soft/30 bg-cream p-6 shadow-sm">
          <div className="mb-4 flex flex-wrap gap-2">
            <span className="rounded-full bg-peach-100 px-4 py-1.5 text-sm font-semibold tracking-wide text-charcoal-soft">
              {product.categoryName}
            </span>
            {product.stock > 0 ? (
              <span className="rounded-full bg-gayatri-50 px-4 py-1.5 text-sm font-semibold tracking-wide text-gayatri-700">
                Tersedia
              </span>
            ) : (
              <span className="rounded-full bg-cream-100 px-4 py-1.5 text-sm font-semibold tracking-wide text-charcoal-soft">
                Stok Habis
              </span>
            )}
          </div>
          <h1 className="mb-2 font-display text-[28px] font-medium leading-9 text-gayatri-600">{product.name}</h1>
          <p className="mb-6 leading-relaxed text-charcoal-soft">{product.description}</p>
          <div className="rounded-xl bg-cream-100 p-4 text-center">
            <p className="mb-1 text-sm font-semibold uppercase tracking-wider text-charcoal-soft">Harga</p>
            <p className="text-[28px] font-bold leading-9 text-gayatri-600">{formatIdr(product.priceIdr)}</p>
          </div>
        </div>
      </div>
    </section>
  )
}

function AboutBlock({ product }: { product: ProductWithCategory }) {
  return (
    <div className="space-y-6">
      <h2 className="font-display text-3xl font-medium leading-10 text-gayatri-600">Tentang Produk</h2>
      <p className="text-lg leading-relaxed text-charcoal-soft">{product.description}</p>
    </div>
  )
}

function BenefitsBlock({ benefits }: { benefits: ProductDetail['benefits'] }) {
  return (
    <div className="space-y-6">
      <h2 className="font-display text-3xl font-medium leading-10 text-gayatri-600">Keunggulan Produk</h2>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {benefits.map((b) => (
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

function UsageBlock({ usage, ingredients }: { usage: string; ingredients?: string }) {
  return (
    <div className="space-y-6">
      <h2 className="font-display text-3xl font-medium leading-10 text-gayatri-600">Cara Penggunaan</h2>
      <p className="text-lg leading-relaxed text-charcoal-soft">{usage}</p>
      {ingredients && (
        <div className="rounded-xl border border-outline-soft/30 bg-cream-100 p-6">
          <h3 className="mb-2 text-sm font-semibold uppercase tracking-wider text-gayatri-600">Kandungan</h3>
          <p className="text-base text-charcoal-soft">{ingredients}</p>
        </div>
      )}
    </div>
  )
}

function PurchaseCard({ product, waNumber }: { product: ProductWithCategory; waNumber: string }) {
  const waText = encodeURIComponent(
    `Halo Gayatri, saya ingin membeli produk:\n*${product.name}*\nHarga: ${formatIdr(product.priceIdr)}\n\nMohon info ketersediaan dan cara pembeliannya. Terima kasih 🙏`
  )

  return (
    <div className="hidden rounded-2xl border border-outline-soft/30 bg-white p-8 shadow-glow lg:block">
      <div className="space-y-6">
        <div>
          <h3 className="mb-1 text-[22px] font-semibold leading-7 text-charcoal">{product.name}</h3>
          <span className="rounded-full bg-peach-100 px-3 py-1 text-xs font-semibold tracking-wide text-charcoal-soft">
            {product.categoryName}
          </span>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between border-b border-outline-soft/20 py-3">
            <div className="flex items-center text-charcoal-soft">
              <span className="material-symbols-outlined mr-2">payments</span>
              <span className="text-base">Harga</span>
            </div>
            <span className="text-[22px] font-semibold leading-7 text-gayatri-600">{formatIdr(product.priceIdr)}</span>
          </div>
          <div className="flex items-center justify-between py-3">
            <div className="flex items-center text-charcoal-soft">
              <span className="material-symbols-outlined mr-2">inventory_2</span>
              <span className="text-base">Stok</span>
            </div>
            {product.stock > 0 ? (
              <span className="rounded-full bg-gayatri-50 px-3 py-1 text-sm font-semibold text-gayatri-700">
                {product.stock <= 5 ? `Sisa ${product.stock}` : 'Tersedia'}
              </span>
            ) : (
              <span className="rounded-full bg-cream-100 px-3 py-1 text-sm font-semibold text-charcoal-soft">
                Habis
              </span>
            )}
          </div>
        </div>
        <a
          href={`https://wa.me/${waNumber}?text=${waText}`}
          target="_blank"
          rel="noreferrer"
          className="block rounded-full bg-gayatri-600 py-4 text-center text-[22px] font-semibold leading-7 text-white transition-all hover:opacity-90 active:scale-95"
        >
          Beli via WhatsApp
        </a>
        <p className="text-center text-xs text-charcoal-soft">
          Pengiriman ke seluruh Indonesia · COD tersedia
        </p>
      </div>
    </div>
  )
}

function StickyMobileCta({ product, waNumber }: { product: ProductWithCategory; waNumber: string }) {
  const waText = encodeURIComponent(
    `Halo Gayatri, saya ingin membeli produk:\n*${product.name}*\nHarga: ${formatIdr(product.priceIdr)}\n\nMohon info ketersediaan dan cara pembeliannya. Terima kasih 🙏`
  )

  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t border-outline-soft/30 bg-cream px-5 py-4 shadow-glow-md lg:hidden">
      <div className="mb-1 flex items-center justify-between text-charcoal-soft">
        <span className="text-xs uppercase tracking-wider">Harga</span>
        <span className="text-lg font-bold text-gayatri-600">{formatIdr(product.priceIdr)}</span>
      </div>
      <a
        href={`https://wa.me/${waNumber}?text=${waText}`}
        target="_blank"
        rel="noreferrer"
        className="flex w-full items-center justify-center gap-3 rounded-xl bg-gayatri-600 py-4 text-sm font-semibold tracking-wide text-white shadow-glow transition-transform duration-200 active:scale-95"
      >
        <span className="material-symbols-outlined">chat</span>
        Beli via WhatsApp
      </a>
    </div>
  )
}
