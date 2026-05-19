import './globals.css'
import type { Metadata } from 'next'
import { Literata, Plus_Jakarta_Sans } from 'next/font/google'
import { Providers } from '@/providers/Providers'

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-jakarta',
  display: 'swap'
})

const literata = Literata({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-literata',
  display: 'swap'
})

export const metadata: Metadata = {
  title: 'Gayatri Admin',
  robots: 'noindex,nofollow'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={`${jakarta.variable} ${literata.variable}`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,300..600,0..1,-25..200"
        />
      </head>
      <body className="min-h-screen bg-cream-100 font-sans text-charcoal antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
