'use client'

import Link from 'next/link'
import { useState, useEffect, useCallback } from 'react'
import type { ProductDto } from '@gayatri/types'

export function ProductBannerSlider({ products }: { products: ProductDto[] }) {
  const [current, setCurrent] = useState(0)
  const [paused, setPaused] = useState(false)

  const next = useCallback(() => {
    setCurrent((c) => (c + 1) % products.length)
  }, [products.length])

  const prev = () => {
    setCurrent((c) => (c - 1 + products.length) % products.length)
  }

  useEffect(() => {
    if (paused || products.length <= 1) return
    const id = setInterval(next, 4000)
    return () => clearInterval(id)
  }, [paused, next, products.length])

  if (products.length === 0) return null

  const product = products[current]

  return (
    <section className="overflow-hidden bg-cream px-5 py-12 md:px-20 md:py-16">
      <div className="mx-auto max-w-7xl">
        <div
          className="relative aspect-[16/9] overflow-hidden rounded-[2.5rem] shadow-glow-md md:aspect-[21/9]"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          {/* slides — crossfade */}
          {products.map((p, i) => (
            <div
              key={p.id}
              className="absolute inset-0 transition-opacity duration-700"
              style={{ opacity: i === current ? 1 : 0, pointerEvents: i === current ? 'auto' : 'none' }}
            >
              {p.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={p.imageUrl} alt={p.name} className="absolute inset-0 h-full w-full object-cover" />
              ) : (
                <div className="absolute inset-0 bg-gayatri-100" />
              )}
              <div className="absolute inset-0 flex items-center bg-gradient-to-r from-black/50 to-transparent">
                <div className="max-w-xl px-8 text-white md:px-16">
                  <span className="mb-3 inline-block rounded-full bg-white/20 px-3 py-1 text-xs font-semibold tracking-widest uppercase backdrop-blur-sm">
                    Produk Organik
                  </span>
                  <h2 className="mb-3 font-display text-2xl font-semibold leading-tight md:text-3xl md:leading-10">
                    {p.name}
                  </h2>
                  <p className="mb-6 text-sm leading-6 opacity-90 line-clamp-2 md:text-base">
                    {p.description}
                  </p>
                  <Link
                    href={`/products/${p.slug}`}
                    className="inline-block rounded-full bg-white px-7 py-3 text-sm font-semibold tracking-wide text-gayatri-600 transition-all hover:bg-gayatri-50 active:scale-95"
                  >
                    Lihat Produk
                  </Link>
                </div>
              </div>
            </div>
          ))}

          {/* prev / next arrows */}
          {products.length > 1 && (
            <>
              <button
                onClick={prev}
                aria-label="Sebelumnya"
                className="absolute left-4 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-black/30 text-white backdrop-blur-sm transition-all hover:bg-black/50 active:scale-95"
              >
                <span className="material-symbols-outlined text-xl">chevron_left</span>
              </button>
              <button
                onClick={next}
                aria-label="Berikutnya"
                className="absolute right-4 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-black/30 text-white backdrop-blur-sm transition-all hover:bg-black/50 active:scale-95"
              >
                <span className="material-symbols-outlined text-xl">chevron_right</span>
              </button>
            </>
          )}

          {/* dot indicators */}
          {products.length > 1 && (
            <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
              {products.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  aria-label={`Slide ${i + 1}`}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    i === current ? 'w-6 bg-white' : 'w-2 bg-white/50'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
        <div className="mt-6 text-center">
          <Link
            href="/products"
            className="inline-flex items-center gap-2 rounded-full border border-gayatri-600 px-8 py-3 text-sm font-semibold tracking-wide text-gayatri-600 transition-all hover:bg-gayatri-600 hover:text-white active:scale-95"
          >
            Lihat Semua Produk
            <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </Link>
        </div>
      </div>
    </section>
  )
}
