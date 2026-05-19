import { Footer, TopNav, WaFloating } from '@/components/site-shell'
import { getWaNumber } from '@/lib/config'
import Link from 'next/link'

const VALUES = [
  {
    icon: 'favorite',
    title: 'Ketulusan',
    desc: 'Setiap sentuhan diberikan dengan hati. Kami merawat bayi Anda seperti merawat buah hati kami sendiri.'
  },
  {
    icon: 'verified_user',
    title: 'Profesionalisme',
    desc: 'Seluruh terapis bersertifikat dan menjalani pelatihan berkala untuk memastikan standar perawatan tertinggi.'
  },
  {
    icon: 'eco',
    title: 'Alami & Aman',
    desc: 'Kami hanya menggunakan produk organik hipoalergenik yang telah diuji dermatologis, bebas bahan kimia berbahaya.'
  },
  {
    icon: 'spa',
    title: 'Pengalaman Premium',
    desc: 'Suasana sanctuary yang tenang, aroma botanis, dan musik lembut untuk menciptakan momen relaksasi terbaik.'
  }
]

const TEAM = [
  {
    name: 'Bunda Ratih Kusuma',
    role: 'Founder & Lead Therapist',
    cert: 'Bersertifikat IAIM & CIBTAC',
    desc: '12 tahun pengalaman di bidang baby wellness. Melatih lebih dari 200 terapis se-Indonesia.'
  },
  {
    name: 'Kak Dian Pertiwi',
    role: 'Head Therapist',
    cert: 'Bersertifikat STOTT Pilates & Baby Yoga',
    desc: 'Spesialis baby swim dan hydrotherapy. Berpengalaman menangani bayi prematur dan berkebutuhan khusus.'
  },
  {
    name: 'Kak Sinta Maharani',
    role: 'Senior Therapist',
    cert: 'Bersertifikat Infant Massage Indonesia',
    desc: 'Ahli pijat kolik dan stimulasi tumbuh kembang untuk bayi usia 0–12 bulan.'
  }
]

const MILESTONES = [
  { year: '2015', title: 'Gayatri Berdiri', desc: 'Studio pertama dibuka di Kebayoran Baru dengan 2 terapis dan 3 jenis layanan.' },
  { year: '2018', title: '1.000 Bayi Dilayani', desc: 'Milestone pertama. Perluasan ruang dan penambahan layanan baby swim.' },
  { year: '2020', title: 'Adaptasi Pandemi', desc: 'Mengembangkan layanan home visit dan konsultasi online untuk tetap melayani keluarga.' },
  { year: '2022', title: 'Standar Internasional', desc: 'Memperoleh sertifikasi IAIM dan bergabung dengan jaringan baby spa premium Asia Tenggara.' },
  { year: '2024', title: 'Platform Digital', desc: 'Meluncurkan sistem reservasi online untuk kemudahan pemesanan kapan saja dan di mana saja.' }
]

export default function AboutPage() {
  const waNumber = getWaNumber()

  return (
    <>
      <TopNav active="about" />
      <main>
        {/* Hero */}
        <section className="relative overflow-hidden bg-gradient-to-br from-gayatri-50 via-cream to-peach-100 px-5 py-20 md:px-20 md:py-28">
          <div className="mx-auto max-w-7xl">
            <div className="max-w-2xl">
              <span className="mb-6 inline-block rounded-full bg-peach-100 px-4 py-1.5 text-sm font-semibold tracking-wide text-charcoal-soft">
                Sejak 2015 · Jakarta
              </span>
              <h1 className="mb-6 font-display text-4xl font-semibold tracking-tight text-gayatri-600 md:text-5xl md:leading-[56px]">
                Ketulusan dalam Kelembutan
              </h1>
              <p className="mb-8 text-lg leading-8 text-charcoal-soft">
                Gayatri Baby Spa lahir dari keyakinan bahwa setiap bayi berhak mendapatkan sentuhan terbaik. Kami
                memadukan kearifan tradisional dengan ilmu tumbuh kembang modern untuk mendukung milestone buah hati
                Anda di setiap tahapan.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  href="/services"
                  className="rounded-full bg-gayatri-600 px-8 py-4 text-sm font-semibold tracking-wide text-white transition-all hover:opacity-90 active:scale-95"
                >
                  Lihat Layanan
                </Link>
                <a
                  href={`https://wa.me/${waNumber}`}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full border border-gayatri-600/40 px-8 py-4 text-sm font-semibold tracking-wide text-gayatri-600 transition-all hover:bg-gayatri-50 active:scale-95"
                >
                  Hubungi Kami
                </a>
              </div>
            </div>
          </div>
          {/* Decorative */}
          <div className="absolute -right-20 -top-20 h-80 w-80 rounded-full bg-gayatri-100/40 md:-right-10 md:-top-10 md:h-96 md:w-96" />
          <div className="absolute -bottom-16 right-32 h-48 w-48 rounded-full bg-peach-100/60" />
        </section>

        {/* Stats */}
        <section className="border-b border-outline-soft/20 bg-white">
          <div className="mx-auto grid max-w-7xl grid-cols-2 divide-x divide-outline-soft/20 md:grid-cols-4">
            {[
              { value: '5.000+', label: 'Bayi Dirawat' },
              { value: '9', label: 'Tahun Berpengalaman' },
              { value: '12', label: 'Terapis Bersertifikat' },
              { value: '4.9★', label: 'Rating Google' }
            ].map(({ value, label }) => (
              <div key={label} className="px-6 py-8 text-center md:px-10">
                <p className="mb-1 font-display text-3xl font-semibold text-gayatri-600 md:text-4xl">{value}</p>
                <p className="text-sm text-charcoal-soft">{label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Story */}
        <section className="mx-auto max-w-7xl px-5 py-16 md:px-20 md:py-20">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <h2 className="mb-6 font-display text-[28px] font-medium leading-9 text-gayatri-600 md:text-3xl md:leading-10">
                Cerita di Balik Gayatri
              </h2>
              <div className="space-y-4 text-lg leading-8 text-charcoal-soft">
                <p>
                  Gayatri dimulai dari sebuah kamar tidur sederhana pada 2015. Pendiri kami, Bunda Ratih, seorang ibu
                  yang juga terapis bersertifikat, melihat betapa sulitnya orang tua menemukan layanan baby spa yang
                  benar-benar aman, profesional, dan terjangkau.
                </p>
                <p>
                  Dengan modal dua set peralatan pijat dan satu kolam renang portabel, Gayatri melayani 3 bayi di
                  minggu pertamanya. Dari mulut ke mulut, kepercayaan keluarga demi keluarga tumbuh menjadi apa yang
                  Anda lihat hari ini.
                </p>
                <p>
                  Nama{' '}
                  <span className="font-semibold text-gayatri-600">Gayatri</span> — diambil dari mantra kuno yang
                  bermakna cahaya dan pencerahan — menjadi pengingat bahwa setiap bayi adalah cahaya keluarga yang
                  layak mendapatkan perawatan terbaik.
                </p>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-[4/3] overflow-hidden rounded-2xl bg-gradient-to-br from-gayatri-100 to-peach-100">
                <div className="flex h-full w-full items-center justify-center">
                  <span className="material-symbols-outlined text-[120px] text-gayatri-300">child_care</span>
                </div>
              </div>
              <div className="absolute -bottom-4 -right-4 rounded-2xl border border-outline-soft/20 bg-white p-4 shadow-glow md:-bottom-6 md:-right-6 md:p-6">
                <p className="text-2xl font-bold text-gayatri-600">4.9/5.0</p>
                <p className="text-sm text-charcoal-soft">dari 800+ ulasan</p>
              </div>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="bg-cream-100 py-16 md:py-20">
          <div className="mx-auto max-w-7xl px-5 md:px-20">
            <h2 className="mb-12 text-center font-display text-[28px] font-medium leading-9 text-gayatri-600 md:text-3xl md:leading-10">
              Nilai Kami
            </h2>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
              {VALUES.map((v) => (
                <div key={v.title} className="rounded-2xl bg-white p-8 shadow-glow">
                  <span
                    className="material-symbols-outlined mb-4 text-4xl text-gayatri-600"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    {v.icon}
                  </span>
                  <h3 className="mb-2 text-[22px] font-semibold leading-7 text-charcoal">{v.title}</h3>
                  <p className="text-base leading-relaxed text-charcoal-soft">{v.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Team */}
        <section className="mx-auto max-w-7xl px-5 py-16 md:px-20 md:py-20">
          <h2 className="mb-12 text-center font-display text-[28px] font-medium leading-9 text-gayatri-600 md:text-3xl md:leading-10">
            Tim Terapis Kami
          </h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {TEAM.map((t) => (
              <div key={t.name} className="rounded-2xl border border-outline-soft/30 bg-white p-8 shadow-glow">
                <div className="mb-5 flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gayatri-50">
                    <span className="material-symbols-outlined text-3xl text-gayatri-600">person</span>
                  </div>
                  <div>
                    <p className="font-semibold text-charcoal">{t.name}</p>
                    <p className="text-sm text-gayatri-600">{t.role}</p>
                  </div>
                </div>
                <div className="mb-4 flex items-center gap-2 rounded-lg bg-gayatri-50 px-3 py-2">
                  <span className="material-symbols-outlined text-[16px] text-gayatri-600">workspace_premium</span>
                  <span className="text-xs font-semibold text-gayatri-700">{t.cert}</span>
                </div>
                <p className="text-base leading-relaxed text-charcoal-soft">{t.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Milestones */}
        <section className="bg-cream-100 py-16 md:py-20">
          <div className="mx-auto max-w-3xl px-5 md:px-20">
            <h2 className="mb-12 text-center font-display text-[28px] font-medium leading-9 text-gayatri-600 md:text-3xl md:leading-10">
              Perjalanan Gayatri
            </h2>
            <div className="relative">
              <div className="absolute left-[19px] top-0 h-full w-0.5 bg-gayatri-100 md:left-1/2 md:-translate-x-px" />
              <div className="space-y-8">
                {MILESTONES.map((m, i) => (
                  <div
                    key={m.year}
                    className={`relative flex items-start gap-6 md:gap-8 ${i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}
                  >
                    <div className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-gayatri-600 bg-cream text-xs font-bold text-gayatri-600 md:absolute md:left-1/2 md:-translate-x-1/2">
                      {m.year.slice(2)}
                    </div>
                    <div className={`md:w-[calc(50%-2.5rem)] ${i % 2 === 0 ? 'md:text-right' : 'md:ml-auto md:text-left'}`}>
                      <div className="rounded-2xl border border-outline-soft/30 bg-white p-5 shadow-glow md:p-6">
                        <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-gayatri-600">{m.year}</p>
                        <h3 className="mb-2 font-semibold text-charcoal">{m.title}</h3>
                        <p className="text-sm leading-relaxed text-charcoal-soft">{m.desc}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="mx-auto max-w-7xl px-5 py-16 md:px-20">
          <div className="flex flex-col items-center rounded-[32px] bg-gayatri-600 p-10 text-center text-white md:p-16">
            <span className="material-symbols-outlined mb-6 text-5xl md:text-6xl">child_care</span>
            <h2 className="mb-4 font-display text-[28px] font-medium leading-9 md:text-3xl md:leading-10">
              Percayakan Perawatan Si Kecil pada Kami
            </h2>
            <p className="mb-8 max-w-xl text-lg leading-7 opacity-90">
              Bergabunglah dengan lebih dari 5.000 keluarga yang telah mempercayai Gayatri Baby Spa untuk tumbuh kembang
              optimal buah hati mereka.
            </p>
            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:gap-4">
              <Link
                href="/checkout"
                className="rounded-full bg-white px-8 py-4 text-sm font-semibold tracking-wide text-gayatri-600 transition-all hover:bg-cream-100"
              >
                Reservasi Sekarang
              </Link>
              <Link
                href="/services"
                className="rounded-full border border-white/40 px-8 py-4 text-sm font-semibold tracking-wide text-white transition-all hover:bg-white/10"
              >
                Lihat Layanan
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
