'use client'

import { useState } from 'react'

export function ContactForm({ waNumber }: { waNumber: string }) {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [message, setMessage] = useState('')

  const canSubmit = name.trim().length > 0 && phone.trim().length >= 9 && message.trim().length > 0

  function handleSubmit() {
    const text = encodeURIComponent(
      `Halo Gayatri Baby Spa,\n\nSaya *${name.trim()}* (${phone.trim()}) ingin menghubungi Anda.\n\n_Pesan:_\n${message.trim()}\n\nTerima kasih 🙏`
    )
    window.open(`https://wa.me/${waNumber}?text=${text}`, '_blank', 'noreferrer')
  }

  return (
    <div className="space-y-5">
      <div>
        <label htmlFor="name" className="mb-2 block text-sm font-semibold text-charcoal">
          Nama Lengkap
        </label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Contoh: Bunda Arini"
          className="w-full rounded-xl border border-outline-soft/40 bg-white px-4 py-3 text-base text-charcoal placeholder:text-charcoal-soft/50 focus:border-gayatri-600 focus:outline-none focus:ring-2 focus:ring-gayatri-600/20"
        />
      </div>

      <div>
        <label htmlFor="phone" className="mb-2 block text-sm font-semibold text-charcoal">
          Nomor WhatsApp
        </label>
        <input
          id="phone"
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="08xx-xxxx-xxxx"
          className="w-full rounded-xl border border-outline-soft/40 bg-white px-4 py-3 text-base text-charcoal placeholder:text-charcoal-soft/50 focus:border-gayatri-600 focus:outline-none focus:ring-2 focus:ring-gayatri-600/20"
        />
      </div>

      <div>
        <label htmlFor="message" className="mb-2 block text-sm font-semibold text-charcoal">
          Pesan
        </label>
        <textarea
          id="message"
          rows={5}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Tulis pertanyaan atau kebutuhan Anda di sini..."
          className="w-full resize-none rounded-xl border border-outline-soft/40 bg-white px-4 py-3 text-base text-charcoal placeholder:text-charcoal-soft/50 focus:border-gayatri-600 focus:outline-none focus:ring-2 focus:ring-gayatri-600/20"
        />
      </div>

      <button
        onClick={handleSubmit}
        disabled={!canSubmit}
        className="flex w-full items-center justify-center gap-3 rounded-full bg-gayatri-600 py-4 text-sm font-semibold tracking-wide text-white transition-all hover:opacity-90 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
      >
        <span className="material-symbols-outlined">chat</span>
        Kirim via WhatsApp
      </button>

      <p className="text-center text-xs text-charcoal-soft">
        Pesan akan dibuka di WhatsApp. Pastikan aplikasi WhatsApp terinstal.
      </p>
    </div>
  )
}
