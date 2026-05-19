import { Footer, TopNav } from '@/components/site-shell'
import { getWaNumber } from '@/lib/config'
import Link from 'next/link'

export default function CheckoutSuccessPage() {
  const waNumber = getWaNumber()

  return (
    <>
      <TopNav />
      <main className="mx-auto max-w-7xl px-5 py-16 md:px-20 md:py-24">
        <div className="mx-auto max-w-xl text-center">
          {/* Icon */}
          <div className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-gayatri-50">
            <span
              className="material-symbols-outlined text-5xl text-gayatri-600"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              check_circle
            </span>
          </div>

          <h1 className="mb-4 font-display text-[28px] font-medium leading-9 text-gayatri-600 md:text-3xl md:leading-10">
            Pesan Terkirim!
          </h1>
          <p className="mb-3 text-lg leading-7 text-charcoal-soft">
            Pesan Anda sudah dikirim ke admin Gayatri Baby Spa via WhatsApp.
          </p>
          <p className="mb-10 text-base text-charcoal-soft">
            Admin kami akan segera menghubungi Anda untuk konfirmasi jadwal dalam waktu{' '}
            <span className="font-semibold text-gayatri-600">1×24 jam</span>.
          </p>

          {/* Steps */}
          <div className="mb-10 rounded-2xl border border-outline-soft/30 bg-white p-6 text-left shadow-glow md:p-8">
            <h2 className="mb-6 text-sm font-semibold uppercase tracking-widest text-gayatri-600">
              Langkah Selanjutnya
            </h2>
            <ol className="space-y-5">
              {[
                { icon: 'chat', step: '1', title: 'Cek WhatsApp Anda', desc: 'Pastikan pesan sudah terkirim. Jika belum, tekan tombol di bawah untuk kirim ulang.' },
                { icon: 'schedule', step: '2', title: 'Tunggu Konfirmasi Admin', desc: 'Admin akan membalas dan mengkonfirmasi jadwal, cabang, serta terapis untuk si kecil.' },
                { icon: 'calendar_month', step: '3', title: 'Datang Tepat Waktu', desc: 'Hadir 10 menit sebelum jadwal. Bawa pakaian ganti dan handuk untuk kenyamanan bayi.' }
              ].map(({ icon, step, title, desc }) => (
                <li key={step} className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gayatri-50 text-gayatri-600">
                    <span className="material-symbols-outlined text-[20px]">{icon}</span>
                  </div>
                  <div>
                    <p className="mb-0.5 font-semibold text-charcoal">{title}</p>
                    <p className="text-sm leading-relaxed text-charcoal-soft">{desc}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
            <a
              href={`https://wa.me/${waNumber}`}
              target="_blank"
              rel="noreferrer"
              className="flex flex-1 items-center justify-center gap-2 rounded-full bg-gayatri-600 px-6 py-4 text-sm font-semibold tracking-wide text-white transition-all hover:opacity-90 active:scale-95"
            >
              <span className="material-symbols-outlined text-[18px]">chat</span>
              Buka WhatsApp
            </a>
            <Link
              href="/"
              className="flex flex-1 items-center justify-center gap-2 rounded-full border border-outline-soft/40 px-6 py-4 text-sm font-semibold tracking-wide text-charcoal-soft transition-all hover:border-gayatri-600 hover:text-gayatri-600 active:scale-95"
            >
              <span className="material-symbols-outlined text-[18px]">home</span>
              Kembali ke Beranda
            </Link>
          </div>

          <p className="mt-8 text-xs text-charcoal-soft">
            Ingin memesan lebih dari satu layanan?{' '}
            <Link href="/checkout" className="text-gayatri-600 underline">
              Pesan lagi
            </Link>
          </p>
        </div>
      </main>
      <Footer waNumber={waNumber} />
    </>
  )
}
