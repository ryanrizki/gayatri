'use client'

import { useState, useEffect, useCallback } from 'react'

export function HeroImageSlider({ images }: { images: string[] }) {
  const [current, setCurrent] = useState(0)

  const next = useCallback(() => {
    setCurrent((c) => (c + 1) % images.length)
  }, [images.length])

  useEffect(() => {
    if (images.length <= 1) return
    const id = setInterval(next, 5000)
    return () => clearInterval(id)
  }, [next, images.length])

  return (
    <div className="relative">
      <div className="relative z-10 aspect-square overflow-hidden rounded-[2rem] shadow-glow-md">
        {images.map((src, i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={i}
            src={src}
            alt="Treatment baby spa Gayatri"
            className="absolute inset-0 h-full w-full object-cover transition-opacity duration-700"
            style={{ opacity: i === current ? 1 : 0 }}
          />
        ))}
        {images.length > 1 && (
          <div className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 gap-1.5">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                aria-label={`Slide ${i + 1}`}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === current ? 'w-5 bg-white' : 'w-1.5 bg-white/50'
                }`}
              />
            ))}
          </div>
        )}
      </div>
      <div className="absolute -right-10 -top-10 -z-0 h-40 w-40 rounded-full bg-gayatri-300 opacity-30 blur-3xl" />
      <div className="absolute -bottom-10 -left-10 -z-0 h-40 w-40 rounded-full bg-peach-100 opacity-50 blur-3xl" />
    </div>
  )
}
