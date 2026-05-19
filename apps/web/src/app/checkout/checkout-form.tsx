'use client'

import { formatDuration, formatIdr, formatIdrShort } from '@/lib/format'
import type { ServiceDto } from '@gayatri/types'
import { useRouter } from 'next/navigation'
import { useMemo, useState } from 'react'

const TIME_SLOTS = ['09:00 WIB', '10:30 WIB', '13:00 WIB', '15:00 WIB', '16:30 WIB']

const AGE_OPTIONS = ['0 - 6 Bulan', '6 - 12 Bulan', '12 - 24 Bulan', 'Di atas 2 Tahun']

const DAY_LABELS = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab']

const MONTH_NAMES = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember'
]

type Step = 1 | 2 | 3

function getMonthMatrix(year: number, month: number) {
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const leadingBlanks = firstDay.getDay()
  const totalDays = lastDay.getDate()
  const cells: (number | null)[] = []
  for (let i = 0; i < leadingBlanks; i++) cells.push(null)
  for (let d = 1; d <= totalDays; d++) cells.push(d)
  while (cells.length % 7 !== 0) cells.push(null)
  return cells
}

function todayISO() {
  const t = new Date()
  return new Date(t.getFullYear(), t.getMonth(), t.getDate())
}

export function CheckoutForm({
  services,
  preselectSlug,
  waNumber
}: {
  services: ServiceDto[]
  preselectSlug?: string
  waNumber: string
}) {
  const initialService = useMemo(
    () => services.find((s) => s.slug === preselectSlug) ?? services[0],
    [services, preselectSlug]
  )

  const router = useRouter()
  const [step, setStep] = useState<Step>(1)
  const [parentName, setParentName] = useState('')
  const [phone, setPhone] = useState('')
  const [babyName, setBabyName] = useState('')
  const [babyAge, setBabyAge] = useState<string>(AGE_OPTIONS[0] as string)
  const [notes, setNotes] = useState('')
  const [selectedServiceId, setSelectedServiceId] = useState<string | undefined>(initialService?.id)

  const today = todayISO()
  const [month, setMonth] = useState(today.getMonth())
  const [year, setYear] = useState(today.getFullYear())
  const [selectedDay, setSelectedDay] = useState<number | null>(null)
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null)

  const selectedService = services.find((s) => s.id === selectedServiceId) ?? initialService

  const monthCells = useMemo(() => getMonthMatrix(year, month), [year, month])

  function shiftMonth(dir: -1 | 1) {
    const newMonth = month + dir
    if (newMonth < 0) {
      setMonth(11)
      setYear(year - 1)
    } else if (newMonth > 11) {
      setMonth(0)
      setYear(year + 1)
    } else {
      setMonth(newMonth)
    }
    setSelectedDay(null)
  }

  function isPast(day: number) {
    const d = new Date(year, month, day)
    return d < today
  }

  const formattedDate = selectedDay
    ? new Date(year, month, selectedDay).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      })
    : '—'

  const canSubmit =
    parentName.trim() !== '' &&
    phone.trim() !== '' &&
    babyName.trim() !== '' &&
    selectedService &&
    selectedDay !== null &&
    selectedSlot !== null

  function buildWaMessage() {
    if (!selectedService) return ''
    const lines = [
      'Halo Admin Gayatri, saya ingin memesan layanan:',
      `• Layanan: ${selectedService.name}`,
      `• Tanggal: ${formattedDate}`,
      `• Jam: ${selectedSlot}`,
      `• Nama Orang Tua: ${parentName}`,
      `• Nomor WA: ${phone}`,
      `• Nama Bayi: ${babyName}`,
      `• Usia Bayi: ${babyAge}`,
      `• Total: ${formatIdr(selectedService.priceIdr)}`
    ]
    if (notes.trim()) lines.push(`• Catatan: ${notes.trim()}`)
    return lines.join('\n')
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!canSubmit) return
    const url = `https://wa.me/${waNumber}?text=${encodeURIComponent(buildWaMessage())}`
    window.open(url, '_blank')
    router.push('/checkout/success')
  }

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12 lg:gap-6">
      <div className="space-y-6 lg:col-span-8 lg:space-y-8">
        <MobileStepper step={step} onJump={setStep} />

        <FormCard
          stepNumber={1}
          title="Informasi Keluarga"
          collapsedOnMobile={step !== 1}
          onMobileExpand={() => setStep(1)}
        >
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <TextField label="Nama Orang Tua" placeholder="Contoh: Siti Aminah" value={parentName} onChange={setParentName} />
            <TextField
              label="Nomor WhatsApp"
              placeholder="0812xxxx"
              value={phone}
              onChange={setPhone}
              type="tel"
              inputMode="tel"
            />
            <TextField label="Nama Bayi" placeholder="Nama lengkap si kecil" value={babyName} onChange={setBabyName} />
            <SelectField label="Usia Bayi" value={babyAge} options={AGE_OPTIONS} onChange={setBabyAge} />
          </div>
          <TextAreaField
            label="Catatan (opsional)"
            placeholder="Alergi, preferensi, kebutuhan khusus..."
            value={notes}
            onChange={setNotes}
          />
        </FormCard>

        <FormCard
          stepNumber={2}
          title="Pilih Layanan"
          collapsedOnMobile={step !== 2}
          onMobileExpand={() => setStep(2)}
        >
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {services.map((s) => {
              const selected = s.id === selectedServiceId
              return (
                <button
                  type="button"
                  key={s.id}
                  onClick={() => setSelectedServiceId(s.id)}
                  className={
                    selected
                      ? 'group relative flex flex-col rounded-xl border-2 border-gayatri-600 bg-gayatri-50 p-4 text-left transition-all'
                      : 'group relative flex flex-col rounded-xl border border-outline-soft/40 bg-white p-4 text-left transition-all hover:border-gayatri-600'
                  }
                >
                  <div className="mb-2 flex items-start justify-between gap-3">
                    <h3
                      className={
                        selected
                          ? 'text-[18px] font-semibold leading-6 text-gayatri-600 md:text-[22px] md:leading-7'
                          : 'text-[18px] font-semibold leading-6 text-charcoal md:text-[22px] md:leading-7'
                      }
                    >
                      {s.name}
                    </h3>
                    {selected ? (
                      <span
                        className="material-symbols-outlined shrink-0 text-gayatri-600"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        check_circle
                      </span>
                    ) : (
                      <span className="block h-6 w-6 shrink-0 rounded-full border-2 border-outline-soft/60" />
                    )}
                  </div>
                  <p className="mb-4 text-xs text-charcoal-soft md:text-sm">{s.description}</p>
                  <div className="mt-auto flex items-center justify-between">
                    <span className="rounded-full bg-peach-100 px-3 py-1 text-xs font-semibold tracking-wide text-charcoal-soft">
                      {formatDuration(s.durationMin)}
                    </span>
                    <span className="text-[18px] font-semibold leading-6 text-charcoal md:text-[22px] md:leading-7">
                      {formatIdrShort(s.priceIdr)}
                    </span>
                  </div>
                </button>
              )
            })}
          </div>
        </FormCard>

        <FormCard
          stepNumber={3}
          title="Pilih Jadwal"
          collapsedOnMobile={step !== 3}
          onMobileExpand={() => setStep(3)}
        >
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            <div className="space-y-4">
              <div className="flex items-center justify-between px-2">
                <h4 className="text-sm font-semibold tracking-wide text-charcoal">
                  {MONTH_NAMES[month]} {year}
                </h4>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => shiftMonth(-1)}
                    className="rounded-full p-1 transition-colors hover:bg-cream-100"
                    aria-label="Bulan sebelumnya"
                  >
                    <span className="material-symbols-outlined">chevron_left</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => shiftMonth(1)}
                    className="rounded-full p-1 transition-colors hover:bg-cream-100"
                    aria-label="Bulan berikutnya"
                  >
                    <span className="material-symbols-outlined">chevron_right</span>
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-7 gap-1">
                {DAY_LABELS.map((d) => (
                  <div key={d} className="py-2 text-center text-xs font-semibold text-charcoal-soft">
                    {d}
                  </div>
                ))}
                {monthCells.map((cell, i) => {
                  if (cell === null) return <div key={i} className="aspect-square" />
                  const past = isPast(cell)
                  const isSelected = cell === selectedDay
                  return (
                    <button
                      key={i}
                      type="button"
                      disabled={past}
                      onClick={() => setSelectedDay(cell)}
                      className={
                        isSelected
                          ? 'aspect-square rounded-full bg-gayatri-600 text-base font-bold text-white'
                          : past
                            ? 'aspect-square cursor-not-allowed text-base text-outline-soft'
                            : 'aspect-square rounded-full text-base text-charcoal transition-colors hover:bg-gayatri-50'
                      }
                    >
                      {cell}
                    </button>
                  )
                })}
              </div>
            </div>
            <div className="space-y-4">
              <h4 className="text-sm font-semibold tracking-wide text-charcoal">Jam Kedatangan</h4>
              <div className="grid grid-cols-2 gap-3">
                {TIME_SLOTS.map((slot) => {
                  const sel = slot === selectedSlot
                  return (
                    <button
                      type="button"
                      key={slot}
                      onClick={() => setSelectedSlot(slot)}
                      className={
                        sel
                          ? 'rounded-lg border border-gayatri-600 bg-gayatri-600 px-4 py-3 text-sm font-semibold tracking-wide text-white transition-all'
                          : 'rounded-lg border border-outline-soft/40 bg-white px-4 py-3 text-sm font-semibold tracking-wide text-charcoal transition-all hover:border-gayatri-600'
                      }
                    >
                      {slot}
                    </button>
                  )
                })}
              </div>
              <div className="flex gap-3 rounded-lg bg-peach-100/50 p-4">
                <span className="material-symbols-outlined shrink-0 text-charcoal-soft">info</span>
                <p className="text-xs text-charcoal-soft">
                  Pastikan si kecil sudah makan dan dalam kondisi sehat minimal 30 menit sebelum sesi dimulai.
                </p>
              </div>
            </div>
          </div>
        </FormCard>
      </div>

      <aside className="lg:col-span-4">
        <div className="space-y-6 lg:sticky lg:top-28">
          <div className="rounded-xl border border-outline-soft/30 bg-cream-100 p-6 shadow-glow">
            <h3 className="mb-6 text-[22px] font-semibold leading-7 text-charcoal">Ringkasan Pesanan</h3>
            <div className="mb-8 space-y-4">
              <SummaryRow label="Layanan" value={selectedService?.name ?? '—'} emphasize />
              <SummaryRow label="Tanggal" value={formattedDate} />
              <SummaryRow label="Waktu" value={selectedSlot ?? '—'} />
              <div className="flex items-center justify-between border-t border-outline-soft/40 pt-4">
                <span className="text-sm font-semibold tracking-wide text-charcoal">Total Biaya</span>
                <span className="font-display text-3xl font-medium leading-10 text-gayatri-600">
                  {selectedService ? formatIdr(selectedService.priceIdr) : '—'}
                </span>
              </div>
            </div>
            <button
              type="submit"
              disabled={!canSubmit}
              className={
                canSubmit
                  ? 'flex w-full items-center justify-center gap-2 rounded-full bg-gayatri-600 py-4 text-sm font-semibold tracking-wide text-white transition-all hover:opacity-90 active:scale-95'
                  : 'flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-full bg-outline-soft/40 py-4 text-sm font-semibold tracking-wide text-white'
              }
            >
              <span className="material-symbols-outlined">verified</span>
              Konfirmasi via WhatsApp
            </button>
            <p className="mt-4 text-center text-xs text-charcoal-soft">
              Dengan menekan tombol, Anda menyetujui{' '}
              <a className="text-gayatri-600 underline" href="#">
                Syarat &amp; Ketentuan
              </a>{' '}
              kami.
            </p>
            <div className="mt-8 space-y-3 border-t border-outline-soft/40 pt-6">
              <TrustRow icon="verified_user" text="Pembayaran aman via WhatsApp / Transfer" />
              <TrustRow icon="clean_hands" text="Terapis tersertifikasi & prokes ketat" />
            </div>
          </div>
        </div>
      </aside>
    </form>
  )
}

function MobileStepper({ step, onJump }: { step: Step; onJump: (s: Step) => void }) {
  const items: { n: Step; label: string }[] = [
    { n: 1, label: 'Identitas' },
    { n: 2, label: 'Layanan' },
    { n: 3, label: 'Jadwal' }
  ]
  return (
    <div className="flex items-center justify-center gap-2 lg:hidden">
      {items.map((it, idx) => (
        <button
          key={it.n}
          type="button"
          onClick={() => onJump(it.n)}
          className="flex items-center gap-2"
          aria-current={step === it.n}
        >
          <span
            className={
              step === it.n
                ? 'flex h-7 w-7 items-center justify-center rounded-full bg-gayatri-600 text-xs font-bold text-white'
                : step > it.n
                  ? 'flex h-7 w-7 items-center justify-center rounded-full bg-gayatri-300 text-xs font-bold text-gayatri-700'
                  : 'flex h-7 w-7 items-center justify-center rounded-full border border-outline-soft/50 text-xs font-bold text-charcoal-soft'
            }
          >
            {it.n}
          </span>
          <span
            className={
              step === it.n
                ? 'text-xs font-semibold tracking-wide text-gayatri-600'
                : 'text-xs tracking-wide text-charcoal-soft'
            }
          >
            {it.label}
          </span>
          {idx < items.length - 1 && <span className="h-px w-4 bg-outline-soft/40" />}
        </button>
      ))}
    </div>
  )
}

function FormCard({
  stepNumber,
  title,
  collapsedOnMobile,
  onMobileExpand,
  children
}: {
  stepNumber: 1 | 2 | 3
  title: string
  collapsedOnMobile: boolean
  onMobileExpand: () => void
  children: React.ReactNode
}) {
  return (
    <section className="rounded-xl border border-outline-soft/30 bg-white p-6 shadow-glow md:p-8">
      <button
        type="button"
        onClick={onMobileExpand}
        className="mb-6 flex w-full items-center gap-3 text-left lg:cursor-default"
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-peach-100 text-sm font-bold text-charcoal-soft">
          {stepNumber}
        </span>
        <h2 className="text-[22px] font-semibold leading-7 text-charcoal">{title}</h2>
      </button>
      <div className={collapsedOnMobile ? 'hidden lg:block' : ''}>
        <div className="space-y-6">{children}</div>
      </div>
    </section>
  )
}

function TextField({
  label,
  placeholder,
  value,
  onChange,
  type = 'text',
  inputMode
}: {
  label: string
  placeholder?: string
  value: string
  onChange: (v: string) => void
  type?: string
  inputMode?: 'text' | 'tel' | 'numeric' | 'email'
}) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold tracking-wide text-charcoal-soft">{label}</label>
      <input
        type={type}
        inputMode={inputMode}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-outline-soft/40 bg-cream-100 px-4 py-3 text-base text-charcoal transition-all focus:border-gayatri-600 focus:outline-none focus:ring-2 focus:ring-gayatri-600/20"
      />
    </div>
  )
}

function SelectField({
  label,
  value,
  options,
  onChange
}: {
  label: string
  value: string
  options: readonly string[]
  onChange: (v: string) => void
}) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold tracking-wide text-charcoal-soft">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full appearance-none rounded-lg border border-outline-soft/40 bg-cream-100 px-4 py-3 text-base text-charcoal transition-all focus:border-gayatri-600 focus:outline-none focus:ring-2 focus:ring-gayatri-600/20"
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </div>
  )
}

function TextAreaField({
  label,
  placeholder,
  value,
  onChange
}: {
  label: string
  placeholder?: string
  value: string
  onChange: (v: string) => void
}) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold tracking-wide text-charcoal-soft">{label}</label>
      <textarea
        rows={3}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full resize-none rounded-lg border border-outline-soft/40 bg-cream-100 px-4 py-3 text-base text-charcoal transition-all focus:border-gayatri-600 focus:outline-none focus:ring-2 focus:ring-gayatri-600/20"
      />
    </div>
  )
}

function SummaryRow({ label, value, emphasize }: { label: string; value: string; emphasize?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <span className="text-base text-charcoal-soft">{label}</span>
      <span
        className={
          emphasize
            ? 'text-right text-[18px] font-semibold leading-6 text-charcoal'
            : 'text-right text-sm font-semibold tracking-wide text-charcoal'
        }
      >
        {value}
      </span>
    </div>
  )
}

function TrustRow({ icon, text }: { icon: string; text: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="material-symbols-outlined text-gayatri-600">{icon}</span>
      <span className="text-xs text-charcoal-soft">{text}</span>
    </div>
  )
}
