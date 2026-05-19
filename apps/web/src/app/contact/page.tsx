import { Footer, TopNav, WaFloating } from '@/components/site-shell'
import { getWaNumber } from '@/lib/config'
import { ContactForm } from './contact-form'

const BUSINESS_INFO = {
  address: 'Jl. Serenity No. 12, Kebayoran Baru, Jakarta Selatan 12110',
  phone: '+62 812-3456-7890',
  email: 'hello@gayatribabyspa.com',
  hours: [
    { day: 'Senin – Jumat', time: '09.00 – 18.00' },
    { day: 'Sabtu', time: '08.00 – 17.00' },
    { day: 'Minggu & Libur Nasional', time: '10.00 – 15.00' }
  ]
}

const FAQ = [
  {
    q: 'Apakah perlu membuat reservasi terlebih dahulu?',
    a: 'Ya, kami sangat menyarankan reservasi minimal 1 hari sebelumnya agar terapis dan fasilitas dapat disiapkan khusus untuk si kecil.'
  },
  {
    q: 'Berapa usia minimum bayi untuk layanan spa?',
    a: 'Usia minimum bergantung pada jenis layanan. Pijat bayi dapat dimulai dari usia 1 bulan, sedangkan baby swim umumnya dari usia 3 bulan. Cek detail di halaman Layanan.'
  },
  {
    q: 'Apakah orang tua boleh mendampingi selama sesi?',
    a: 'Tentu! Kami sangat mendorong orang tua untuk hadir dan menyaksikan sesi perawatan. Kehadiran orang tua justru membuat bayi lebih nyaman dan tenang.'
  },
  {
    q: 'Bagaimana jika saya perlu membatalkan atau mengubah jadwal?',
    a: 'Pembatalan atau perubahan jadwal dapat dilakukan maksimal 3 jam sebelum sesi melalui WhatsApp. Kami akan membantu menjadwalkan ulang sesuai ketersediaan.'
  },
  {
    q: 'Apakah tersedia layanan home visit?',
    a: 'Saat ini kami melayani home visit dalam radius 10 km dari lokasi kami. Hubungi kami via WhatsApp untuk informasi biaya tambahan dan ketersediaan.'
  }
]

export default function ContactPage() {
  const waNumber = getWaNumber()

  return (
    <>
      <TopNav active="contact" />
      <main>
        {/* Header */}
        <section className="px-5 pb-12 pt-12 text-center md:px-20 md:pt-16">
          <div className="mx-auto max-w-2xl">
            <h1 className="mb-4 font-display text-4xl font-semibold tracking-tight text-gayatri-600 md:text-5xl md:leading-[56px]">
              Hubungi Kami
            </h1>
            <p className="text-lg leading-7 text-charcoal-soft">
              Kami senang mendengar dari Anda. Tanyakan tentang layanan, produk, atau jadwal kunjungan si kecil.
            </p>
          </div>
        </section>

        {/* Info Cards */}
        <section className="mx-auto max-w-7xl px-5 pb-16 md:px-20">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <InfoCard
              icon="location_on"
              title="Alamat"
              lines={[BUSINESS_INFO.address]}
              action={{ label: 'Lihat Peta', href: `https://maps.google.com/?q=${encodeURIComponent(BUSINESS_INFO.address)}` }}
            />
            <InfoCard
              icon="chat"
              title="WhatsApp & Telepon"
              lines={[BUSINESS_INFO.phone, BUSINESS_INFO.email]}
              action={{ label: 'Chat Sekarang', href: `https://wa.me/${waNumber}` }}
            />
            <div className="rounded-2xl border border-outline-soft/30 bg-white p-8 shadow-glow">
              <span className="material-symbols-outlined mb-4 text-4xl text-gayatri-600">schedule</span>
              <h3 className="mb-4 text-[22px] font-semibold leading-7 text-charcoal">Jam Operasional</h3>
              <ul className="space-y-3">
                {BUSINESS_INFO.hours.map(({ day, time }) => (
                  <li key={day} className="flex items-start justify-between gap-4 text-base">
                    <span className="text-charcoal-soft">{day}</span>
                    <span className="shrink-0 font-semibold text-gayatri-600">{time}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Contact Form + Map */}
        <section className="mx-auto max-w-7xl px-5 pb-16 md:px-20">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            <div>
              <h2 className="mb-2 font-display text-3xl font-medium leading-10 text-gayatri-600">
                Kirim Pesan
              </h2>
              <p className="mb-8 text-base text-charcoal-soft">
                Isi formulir berikut dan pesan Anda akan dikirim langsung via WhatsApp.
              </p>
              <ContactForm waNumber={waNumber} />
            </div>
            <div className="overflow-hidden rounded-2xl border border-outline-soft/30 bg-gayatri-50 shadow-glow">
              <div className="flex h-full min-h-[360px] flex-col items-center justify-center gap-4 p-8 text-center">
                <span className="material-symbols-outlined text-6xl text-gayatri-300">map</span>
                <p className="text-base font-semibold text-gayatri-600">Peta Lokasi</p>
                <p className="max-w-xs text-sm text-charcoal-soft">{BUSINESS_INFO.address}</p>
                <a
                  href={`https://maps.google.com/?q=${encodeURIComponent(BUSINESS_INFO.address)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full border border-gayatri-600 px-6 py-2.5 text-sm font-semibold text-gayatri-600 transition-colors hover:bg-gayatri-50"
                >
                  Buka di Google Maps
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="bg-cream-100 py-16">
          <div className="mx-auto max-w-3xl px-5 md:px-20">
            <h2 className="mb-10 text-center font-display text-[28px] font-medium leading-9 text-gayatri-600 md:text-3xl md:leading-10">
              Pertanyaan Umum
            </h2>
            <div className="space-y-4">
              {FAQ.map((item) => (
                <div key={item.q} className="rounded-2xl border border-outline-soft/30 bg-white p-6 shadow-glow">
                  <h3 className="mb-3 font-semibold leading-snug text-charcoal">{item.q}</h3>
                  <p className="text-base leading-relaxed text-charcoal-soft">{item.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* WA CTA */}
        <section className="mx-auto max-w-7xl px-5 py-16 md:px-20">
          <div className="flex flex-col items-center rounded-[32px] bg-gayatri-600 p-10 text-center text-white md:p-16">
            <span className="material-symbols-outlined mb-6 text-5xl md:text-6xl">support_agent</span>
            <h2 className="mb-4 font-display text-[28px] font-medium leading-9 md:text-3xl md:leading-10">
              Butuh Bantuan Cepat?
            </h2>
            <p className="mb-8 max-w-xl text-lg leading-7 opacity-90">
              Tim kami siap menjawab pertanyaan Anda via WhatsApp setiap hari selama jam operasional.
            </p>
            <a
              href={`https://wa.me/${waNumber}`}
              target="_blank"
              rel="noreferrer"
              className="rounded-full bg-white px-8 py-4 text-sm font-semibold tracking-wide text-gayatri-600 transition-all hover:bg-cream-100"
            >
              Chat via WhatsApp
            </a>
          </div>
        </section>
      </main>
      <Footer waNumber={waNumber} />
      <WaFloating waNumber={waNumber} />
    </>
  )
}

function InfoCard({
  icon,
  title,
  lines,
  action
}: {
  icon: string
  title: string
  lines: string[]
  action: { label: string; href: string }
}) {
  return (
    <div className="flex flex-col rounded-2xl border border-outline-soft/30 bg-white p-8 shadow-glow">
      <span className="material-symbols-outlined mb-4 text-4xl text-gayatri-600">{icon}</span>
      <h3 className="mb-4 text-[22px] font-semibold leading-7 text-charcoal">{title}</h3>
      <div className="mb-6 flex-1 space-y-2">
        {lines.map((l) => (
          <p key={l} className="text-base text-charcoal-soft">{l}</p>
        ))}
      </div>
      <a
        href={action.href}
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center gap-2 text-sm font-semibold text-gayatri-600 transition-opacity hover:opacity-80"
      >
        {action.label}
        <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
      </a>
    </div>
  )
}
