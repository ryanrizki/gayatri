'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/cn'

type Role = 'OWNER' | 'ADMIN' | 'STAFF'

const NAV: { href: string; label: string; icon: string; roles?: Role[] }[] = [
  { href: '/', label: 'Dashboard', icon: 'dashboard' },
  { href: '/checkouts', label: 'Checkout', icon: 'receipt_long' },
  { href: '/services', label: 'Layanan', icon: 'spa' },
  { href: '/products', label: 'Produk', icon: 'inventory_2' },
  { href: '/categories', label: 'Kategori', icon: 'category' },
  { href: '/banners', label: 'Banner', icon: 'image' },
  { href: '/branches', label: 'Cabang', icon: 'store' },
  { href: '/therapists', label: 'Terapis', icon: 'group' },
  { href: '/customers', label: 'Pelanggan', icon: 'contacts' },
  { href: '/wa', label: 'WhatsApp', icon: 'chat', roles: ['OWNER', 'ADMIN'] },
  { href: '/wa/connect', label: 'WA Connect', icon: 'qr_code_scanner', roles: ['OWNER', 'ADMIN'] },
  { href: '/settings', label: 'Pengaturan', icon: 'settings', roles: ['OWNER', 'ADMIN'] }
]

const ROLE_LABEL: Record<Role, string> = {
  OWNER: 'Super Admin',
  ADMIN: 'Admin',
  STAFF: 'Staf'
}

export function Sidebar({ user }: { user: { email: string; role: Role } }) {
  const pathname = usePathname()
  const items = NAV.filter((n) => !n.roles || n.roles.includes(user.role))
  const displayName = (user.email.split('@')[0] ?? 'Admin')
    .replace(/[._-]+/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())

  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-outline-soft/30 bg-white lg:flex">
      {/* Brand */}
      <div className="flex h-20 flex-col justify-center border-b border-outline-soft/30 px-6">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gayatri-600 text-white">
            <span className="material-symbols-outlined text-[20px]">spa</span>
          </span>
          <span className="font-display text-lg font-semibold leading-tight text-gayatri-600">
            Gayatri Baby Spa
          </span>
        </div>
        <p className="mt-1 pl-[46px] text-[10px] font-semibold uppercase tracking-[0.18em] text-charcoal-soft">
          Admin Management
        </p>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-5">
        {items.map((n) => {
          const active = pathname === n.href || (n.href !== '/' && pathname.startsWith(n.href))
          return (
            <Link
              key={n.href}
              href={n.href}
              className={cn(
                'flex items-center gap-3 rounded-xl border-l-4 px-3 py-2.5 text-sm font-medium transition-colors',
                active
                  ? 'border-gayatri-600 bg-gayatri-50 text-gayatri-600'
                  : 'border-transparent text-charcoal-soft hover:bg-cream-200 hover:text-charcoal'
              )}
            >
              <span
                className="material-symbols-outlined text-[20px]"
                style={active ? { fontVariationSettings: "'FILL' 1" } : undefined}
              >
                {n.icon}
              </span>
              {n.label}
            </Link>
          )
        })}
      </nav>

      {/* User footer */}
      <div className="flex items-center gap-3 border-t border-outline-soft/30 px-5 py-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gayatri-50 text-gayatri-600">
          <span className="material-symbols-outlined text-[22px]">person</span>
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-charcoal">{displayName}</p>
          <p className="truncate text-xs text-charcoal-soft">{ROLE_LABEL[user.role]}</p>
        </div>
      </div>
    </aside>
  )
}
