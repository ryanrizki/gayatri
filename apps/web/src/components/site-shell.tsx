'use client'

import Link from 'next/link'
import { useState } from 'react'

export { getWaNumber } from '@/lib/config'

type NavKey = 'home' | 'services' | 'products' | 'about' | 'contact' | 'status'

const NAV_ITEMS: { key: NavKey; label: string; href: string }[] = [
  { key: 'home', label: 'Beranda', href: '/' },
  { key: 'services', label: 'Layanan', href: '/services' },
  { key: 'products', label: 'Produk', href: '/products' },
  { key: 'about', label: 'Tentang Kami', href: '/about' },
  { key: 'contact', label: 'Kontak', href: '/contact' }
]

export function TopNav({ active }: { active?: NavKey }) {
  const [open, setOpen] = useState(false)

  return (
    <nav className="sticky top-0 z-50 w-full bg-cream/80 shadow-glow backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-5 py-4 md:px-20">
        <Link
          href="/"
          className="font-display text-2xl font-bold tracking-tight text-gayatri-600 md:text-[28px]"
        >
          Gayatri Baby Spa
        </Link>
        <div className="hidden items-center gap-8 md:flex">
          {NAV_ITEMS.map((item) => {
            const isActive = item.key === active
            return (
              <Link
                key={item.key}
                href={item.href}
                className={
                  isActive
                    ? 'border-b-2 border-gayatri-600 pb-1 text-base font-bold text-gayatri-600'
                    : 'text-base text-charcoal-soft transition-colors hover:text-gayatri-600'
                }
              >
                {item.label}
              </Link>
            )
          })}
          <Link
            href="/checkout"
            className="rounded-full bg-gayatri-600 px-6 py-2.5 text-sm font-semibold tracking-wide text-white transition-all duration-200 hover:opacity-90 active:scale-95"
          >
            Reservasi
          </Link>
        </div>
        <button
          className="md:hidden"
          aria-label="Menu"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <span className="material-symbols-outlined text-gayatri-600">
            {open ? 'close' : 'menu'}
          </span>
        </button>
      </div>
      {open && (
        <div className="md:hidden border-t border-outline-soft/20 bg-cream/95 px-5 py-4 backdrop-blur-md">
          <ul className="flex flex-col gap-4">
            {NAV_ITEMS.map((item) => {
              const isActive = item.key === active
              return (
                <li key={item.key}>
                  <Link
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={
                      isActive
                        ? 'block font-bold text-gayatri-600'
                        : 'block text-charcoal-soft transition-colors hover:text-gayatri-600'
                    }
                  >
                    {item.label}
                  </Link>
                </li>
              )
            })}
            <li>
              <Link
                href="/checkout"
                onClick={() => setOpen(false)}
                className="block rounded-full bg-gayatri-600 px-6 py-2.5 text-center text-sm font-semibold tracking-wide text-white transition-all duration-200 hover:opacity-90 active:scale-95"
              >
                Reservasi
              </Link>
            </li>
          </ul>
        </div>
      )}
    </nav>
  )
}

export function Footer({ waNumber }: { waNumber: string }) {
  return (
    <footer className="w-full border-t border-outline-soft/30 bg-cream-100">
      <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-6 px-5 py-16 md:grid-cols-3 md:px-20">
        <div>
          <div className="mb-6 font-display text-2xl text-gayatri-600">Gayatri Baby Spa</div>
          <p className="mb-4 text-base text-charcoal-soft">
            Ketulusan dalam Kelembutan. Sanctuary premium untuk kesehatan dan kebahagiaan buah hati Anda.
          </p>
          <div className="flex gap-4 text-gayatri-600">
            <a href="#" aria-label="Instagram" className="transition-opacity hover:opacity-80">
              <span className="material-symbols-outlined">photo_camera</span>
            </a>
            <a href="#" aria-label="TikTok" className="transition-opacity hover:opacity-80">
              <span className="material-symbols-outlined">play_circle</span>
            </a>
          </div>
        </div>
        <div>
          <h4 className="mb-6 text-sm font-semibold uppercase tracking-widest text-gayatri-600">
            Tautan Cepat
          </h4>
          <ul className="space-y-4">
            <li>
              <Link href="/services" className="text-base text-charcoal-soft transition-colors hover:text-gayatri-600">
                Layanan
              </Link>
            </li>
            <li>
              <Link href="/products" className="text-base text-charcoal-soft transition-colors hover:text-gayatri-600">
                Produk
              </Link>
            </li>
            <li>
              <Link href="/about" className="text-base text-charcoal-soft transition-colors hover:text-gayatri-600">
                Tentang Kami
              </Link>
            </li>
            <li>
              <Link href="/contact" className="text-base text-charcoal-soft transition-colors hover:text-gayatri-600">
                Kontak Kami
              </Link>
            </li>
            <li>
              <Link href="/status" className="text-base text-charcoal-soft transition-colors hover:text-gayatri-600">
                Cek Status Pesanan
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="mb-6 text-sm font-semibold uppercase tracking-widest text-gayatri-600">
            Hubungi Kami
          </h4>
          <div className="space-y-4">
            <p className="flex items-center gap-3 text-base text-charcoal-soft">
              <span className="material-symbols-outlined text-xl text-gayatri-600">location_on</span>
              Jl. Serenity No. 12, Jakarta Selatan
            </p>
            <p className="flex items-center gap-3 text-base text-charcoal-soft">
              <span className="material-symbols-outlined text-xl text-gayatri-600">call</span>
              +62 812-3456-7890
            </p>
            <a
              href={`https://wa.me/${waNumber}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-3 text-base font-semibold text-gayatri-600 transition-opacity hover:opacity-80"
            >
              <span className="material-symbols-outlined">chat</span>
              WhatsApp Admin
            </a>
          </div>
        </div>
      </div>
      <div className="border-t border-outline-soft/10 px-5 py-6 text-center md:px-20">
        <p className="text-sm tracking-wide text-charcoal-soft">
          © {new Date().getFullYear()} Gayatri Baby Spa. Ketulusan dalam Kelembutan.
        </p>
      </div>
    </footer>
  )
}

export function WaFloating({ waNumber }: { waNumber: string }) {
  return (
    <a
      href={`https://wa.me/${waNumber}`}
      target="_blank"
      rel="noreferrer"
      aria-label="Chat WhatsApp Admin Gayatri"
      className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg transition-transform hover:scale-105 active:scale-95"
    >
      <span className="material-symbols-outlined">chat</span>
    </a>
  )
}

