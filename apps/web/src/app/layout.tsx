import './globals.css'
import type { Metadata } from 'next'
import { Literata, Plus_Jakarta_Sans } from 'next/font/google'

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
  title: 'Gayatri Baby Spa',
  description: 'Layanan baby spa premium untuk si kecil'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={`${jakarta.variable} ${literata.variable}`}>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-cream text-charcoal min-h-screen font-sans antialiased">{children}</body>
    </html>
  )
}
