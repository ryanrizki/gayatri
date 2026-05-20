'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { cn } from '@/lib/cn'

type Role = 'OWNER' | 'ADMIN' | 'STAFF'

type NavLeaf = { href: string; label: string; icon: string; roles?: Role[] }
type NavGroup = { label: string; icon: string; roles?: Role[]; children: NavLeaf[] }
type NavItem = NavLeaf | NavGroup

const isGroup = (i: NavItem): i is NavGroup => 'children' in i

// Grouped by domain so the sidebar stays short. Single-link entries (Dashboard,
// Pengaturan) live at the top level; everything else collapses under a group.
const NAV: NavItem[] = [
  { href: '/', label: 'Dashboard', icon: 'dashboard' },
  {
    label: 'Pesanan',
    icon: 'receipt_long',
    children: [
      { href: '/checkouts', label: 'Checkout', icon: 'shopping_bag' },
      { href: '/customers', label: 'Pelanggan', icon: 'contacts' }
    ]
  },
  {
    label: 'Katalog',
    icon: 'inventory_2',
    children: [
      { href: '/services', label: 'Layanan', icon: 'spa' },
      { href: '/products', label: 'Produk', icon: 'shopping_bag' },
      { href: '/categories', label: 'Kategori', icon: 'category' },
      { href: '/banners', label: 'Banner', icon: 'image' }
    ]
  },
  {
    label: 'Operasi',
    icon: 'business',
    children: [
      { href: '/branches', label: 'Cabang', icon: 'store' },
      { href: '/therapists', label: 'Terapis', icon: 'group' }
    ]
  },
  {
    label: 'WhatsApp',
    icon: 'chat',
    roles: ['OWNER', 'ADMIN'],
    children: [
      { href: '/wa', label: 'Template & Log', icon: 'sms' },
      { href: '/wa/connect', label: 'Pairing', icon: 'qr_code_scanner' }
    ]
  },
  { href: '/settings', label: 'Pengaturan', icon: 'settings', roles: ['OWNER', 'ADMIN'] }
]

const ROLE_LABEL: Record<Role, string> = {
  OWNER: 'Super Admin',
  ADMIN: 'Admin',
  STAFF: 'Staf'
}

function matchPath(pathname: string, href: string): boolean {
  if (href === '/') return pathname === '/'
  return pathname === href || pathname.startsWith(href + '/')
}

function filterByRole(items: NavItem[], role: Role): NavItem[] {
  return items
    .filter((i) => !i.roles || i.roles.includes(role))
    .map((i) =>
      isGroup(i)
        ? { ...i, children: i.children.filter((c) => !c.roles || c.roles.includes(role)) }
        : i
    )
    .filter((i) => !isGroup(i) || i.children.length > 0)
}

export function Sidebar({ user }: { user: { email: string; role: Role } }) {
  const pathname = usePathname()
  const items = filterByRole(NAV, user.role)

  // Track which groups are open. Auto-open the group containing the active
  // route on first render / when pathname changes; user can still toggle.
  const [open, setOpen] = useState<Record<string, boolean>>({})
  useEffect(() => {
    setOpen((prev) => {
      const next = { ...prev }
      for (const i of items) {
        if (isGroup(i) && i.children.some((c) => matchPath(pathname, c.href))) {
          next[i.label] = true
        }
      }
      return next
    })
    // items derived from user.role; recompute when pathname changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, user.role])

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
        {items.map((item) => {
          if (!isGroup(item)) {
            const active = matchPath(pathname, item.href)
            return <NavLink key={item.href} item={item} active={active} />
          }
          const isOpen = open[item.label] ?? false
          const hasActiveChild = item.children.some((c) => matchPath(pathname, c.href))
          return (
            <div key={item.label} className="space-y-1">
              <button
                type="button"
                onClick={() => setOpen((p) => ({ ...p, [item.label]: !isOpen }))}
                aria-expanded={isOpen}
                className={cn(
                  'flex w-full items-center gap-3 rounded-xl border-l-4 px-3 py-2.5 text-sm font-medium transition-colors',
                  hasActiveChild
                    ? 'border-gayatri-600 bg-gayatri-50 text-gayatri-600'
                    : 'border-transparent text-charcoal-soft hover:bg-cream-200 hover:text-charcoal'
                )}
              >
                <span
                  className="material-symbols-outlined text-[20px]"
                  style={hasActiveChild ? { fontVariationSettings: "'FILL' 1" } : undefined}
                >
                  {item.icon}
                </span>
                <span className="flex-1 text-left">{item.label}</span>
                <span
                  className={cn(
                    'material-symbols-outlined text-[18px] transition-transform',
                    isOpen ? 'rotate-180' : ''
                  )}
                >
                  expand_more
                </span>
              </button>
              {isOpen && (
                <div className="ml-3 space-y-0.5 border-l border-outline-soft/30 pl-3">
                  {item.children.map((c) => (
                    <NavLink key={c.href} item={c} active={matchPath(pathname, c.href)} compact />
                  ))}
                </div>
              )}
            </div>
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

function NavLink({ item, active, compact }: { item: NavLeaf; active: boolean; compact?: boolean }) {
  return (
    <Link
      href={item.href}
      className={cn(
        'flex items-center gap-3 rounded-xl border-l-4 transition-colors',
        compact ? 'px-2.5 py-2 text-[13px]' : 'px-3 py-2.5 text-sm font-medium',
        active
          ? 'border-gayatri-600 bg-gayatri-50 text-gayatri-600'
          : 'border-transparent text-charcoal-soft hover:bg-cream-200 hover:text-charcoal'
      )}
    >
      <span
        className={cn('material-symbols-outlined', compact ? 'text-[18px]' : 'text-[20px]')}
        style={active ? { fontVariationSettings: "'FILL' 1" } : undefined}
      >
        {item.icon}
      </span>
      {item.label}
    </Link>
  )
}
