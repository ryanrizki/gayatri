import { api } from '@/lib/api'
import { Footer, TopNav, WaFloating } from '@/components/site-shell'
import { getWaNumber } from '@/lib/config'
import { formatIdr, formatIdrShort } from '@/lib/format'
import type { ProductDto } from '@gayatri/types'
import Link from 'next/link'

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
    description: 'Minyak pijat organik dengan ekstrak lavender asli untuk relaksasi dan kelembutan kulit bayi sensitif.',
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
    description: 'Formula organik dari adas, kelapa, dan kayu putih untuk menghangatkan dan melindungi perut bayi.',
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
    description: 'Handuk ultra-lembut dari serat bambu organik, hipoalergenik, dan cepat menyerap untuk kulit bayi sensitif.',
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
    description: 'Paket sabun cair dan lotion dengan aloe vera dan chamomile untuk menjaga kelembapan kulit bayi sepanjang hari.',
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
    description: 'Paket hadiah lengkap untuk bayi baru lahir: minyak pijat, lotion, handuk mandi, dan kartu ucapan eksklusif.',
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
    description: 'Koleksi bando bayi dari bahan katun lembut, berbagai motif. Aman untuk kepala bayi baru lahir.',
    priceIdr: 45_000,
    stock: 30,
    imageUrl: null,
    categoryId: 'aksesoris',
    categoryName: 'Aksesoris',
    active: true
  }
]

const FILTER_CATEGORIES = ['Semua', 'Minyak & Serum', 'Perlengkapan Mandi', 'Paket Spesial', 'Aksesoris'] as const

export default async function ProductsPage() {
  const products = await api<ProductDto[]>('/v1/catalog/products').catch(() => [] as ProductDto[])
  const displayed: ProductWithCategory[] =
    products.length > 0
      ? products.map((p) => ({ ...p, categoryName: CATEGORY_MAP[p.categoryId] ?? p.categoryId }))
      : PLACEHOLDER_PRODUCTS
  const waNumber = getWaNumber()

  return (
    <>
      <TopNav active="products" />
      <main className="mx-auto max-w-7xl">
        <section className="px-5 pb-12 pt-12 text-center md:px-20 md:pt-16">
          <h1 className="mb-4 font-display text-4xl font-semibold tracking-tight text-gayatri-600 md:text-5xl md:leading-[56px]">
            Produk Perawatan Bayi
          </h1>
          <p className="mx-auto mb-10 max-w-2xl text-lg leading-7 text-charcoal-soft">
            Rangkaian produk premium pilihan terapis kami — lembut, organik, dan aman untuk si kecil sejak hari pertama.
          </p>
          <CategoryFilter />
        </section>

        <section className="px-5 pb-16 md:px-20">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-2 md:gap-6 lg:grid-cols-3">
            {displayed.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>

        <section className="px-5 pb-16 md:px-20">
          <div className="flex flex-col items-center rounded-[32px] bg-gayatri-600 p-10 text-center text-white md:p-16">
            <span className="material-symbols-outlined mb-6 text-5xl md:text-6xl">local_florist</span>
            <h2 className="mb-4 font-display text-[28px] font-medium leading-9 md:text-3xl md:leading-10">
              Butuh Rekomendasi Produk?
            </h2>
            <p className="mb-8 max-w-xl text-lg leading-7 opacity-90">
              Tim kami siap membantu memilih produk yang paling sesuai untuk jenis kulit dan kebutuhan bayi Anda.
            </p>
            <a
              href={`https://wa.me/${waNumber}`}
              target="_blank"
              rel="noreferrer"
              className="rounded-full bg-white px-8 py-4 text-sm font-semibold tracking-wide text-gayatri-600 transition-all hover:bg-cream-100"
            >
              Konsultasi via WhatsApp
            </a>
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

function ProductCard({ product }: { product: ProductWithCategory }) {
  const lowStock = product.stock > 0 && product.stock <= 5
  const outOfStock = product.stock === 0

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-outline-soft/30 bg-white shadow-glow transition-transform duration-300 hover:-translate-y-1"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-gayatri-50">
        {product.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.imageUrl}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <span className="material-symbols-outlined text-5xl text-gayatri-300 md:text-7xl">spa</span>
          </div>
        )}
        <div className="absolute left-3 top-3 md:left-4 md:top-4">
          <span className="rounded-full bg-peach-100 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-charcoal-soft md:text-xs">
            {product.categoryName}
          </span>
        </div>
        {outOfStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-cream/80">
            <span className="rounded-full bg-charcoal px-4 py-1.5 text-xs font-semibold text-white">Stok Habis</span>
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col p-4 md:p-6">
        <h3 className="mb-1 text-base font-semibold leading-tight text-gayatri-600 md:mb-2 md:text-[22px] md:leading-7">
          {product.name}
        </h3>
        <p className="mb-3 line-clamp-2 text-xs text-charcoal-soft md:mb-4 md:text-base">{product.description}</p>
        <div className="mt-auto flex items-center justify-between border-t border-outline-soft/20 pt-3 md:pt-4">
          <div className="flex flex-col gap-1">
            {lowStock && (
              <span className="hidden items-center gap-1 text-xs text-amber-600 md:flex">
                <span className="material-symbols-outlined text-[14px]">warning</span>
                Sisa {product.stock}
              </span>
            )}
            <span className="text-sm font-bold text-gayatri-600 md:text-[22px] md:font-semibold md:leading-7">
              <span className="md:hidden">{formatIdrShort(product.priceIdr)}</span>
              <span className="hidden md:inline">{formatIdr(product.priceIdr)}</span>
            </span>
          </div>
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gayatri-600 text-white transition-colors md:h-10 md:w-10 md:bg-gayatri-50 md:text-gayatri-600 md:group-hover:bg-gayatri-600 md:group-hover:text-white">
            <span className="material-symbols-outlined text-[18px] md:text-[20px]">shopping_bag</span>
          </span>
        </div>
      </div>
    </Link>
  )
}
