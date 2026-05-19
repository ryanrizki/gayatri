import Link from 'next/link'
import { DashboardStats } from './dashboard-stats'

const QUICK_LINKS = [
  { href: '/checkouts?status=NEW', icon: 'inbox', label: 'Pesanan Baru', desc: 'Konfirmasi & jadwalkan' },
  { href: '/services', icon: 'spa', label: 'Layanan', desc: 'Kelola katalog spa' },
  { href: '/products', icon: 'inventory_2', label: 'Produk', desc: 'Stok & harga' },
  { href: '/customers', icon: 'contacts', label: 'Pelanggan', desc: 'Riwayat & data' }
]

export default function DashboardPage() {
  return (
    <div className="space-y-7">
      <div>
        <h1 className="font-display text-2xl font-semibold text-gayatri-600 md:text-3xl">
          Dashboard Ringkasan
        </h1>
        <p className="mt-1 text-sm text-charcoal-soft">
          Ringkasan booking, jadwal hari ini, dan pendapatan minggu ini.
        </p>
      </div>

      <DashboardStats />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* Promo / guidance */}
        <div className="flex flex-col justify-between rounded-2xl bg-gradient-to-br from-gayatri-600 to-gayatri-700 p-7 text-white lg:col-span-1">
          <div>
            <span className="material-symbols-outlined text-3xl">insights</span>
            <h2 className="mt-4 font-display text-xl font-semibold">Alur Kerja Harian</h2>
            <p className="mt-2 text-sm leading-relaxed text-white/80">
              Mulai dari pesanan baru, konfirmasi jadwal, lalu pantau pendapatan. Semua dalam satu tempat.
            </p>
          </div>
          <Link
            href="/checkouts?status=NEW"
            className="mt-6 inline-flex w-fit items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-gayatri-600 transition-opacity hover:opacity-90"
          >
            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            Lihat Pesanan Baru
          </Link>
        </div>

        {/* Quick links */}
        <div className="rounded-2xl border border-outline-soft/30 bg-white p-6 lg:col-span-2">
          <h2 className="mb-5 text-sm font-semibold uppercase tracking-[0.14em] text-charcoal-soft">
            Akses Cepat
          </h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {QUICK_LINKS.map((q) => (
              <Link
                key={q.href}
                href={q.href}
                className="group flex items-center gap-4 rounded-xl border border-outline-soft/30 p-4 transition-colors hover:border-gayatri-600 hover:bg-cream-100"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-gayatri-50 text-gayatri-600">
                  <span className="material-symbols-outlined text-[22px]">{q.icon}</span>
                </span>
                <div className="min-w-0">
                  <p className="font-semibold text-charcoal">{q.label}</p>
                  <p className="text-xs text-charcoal-soft">{q.desc}</p>
                </div>
                <span className="material-symbols-outlined ml-auto text-[20px] text-charcoal-soft transition-transform group-hover:translate-x-1">
                  chevron_right
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
