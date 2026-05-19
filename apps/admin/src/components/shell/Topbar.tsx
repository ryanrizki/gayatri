'use client'

import { useRouter } from 'next/navigation'
import { useMutation } from '@tanstack/react-query'
import { adminApi } from '@/lib/api'
import { Button } from '@/components/ui/button'

export function Topbar({ user }: { user: { email: string; role: string } }) {
  const router = useRouter()
  const logout = useMutation({
    mutationFn: () => adminApi('/admin/auth/logout', { method: 'POST' }),
    onSuccess: () => {
      router.replace('/login')
      router.refresh()
    }
  })

  return (
    <header className="sticky top-0 z-20 flex h-20 items-center gap-4 border-b border-outline-soft/30 bg-cream/85 px-4 backdrop-blur md:px-8">
      {/* Mobile brand */}
      <div className="flex items-center gap-2 lg:hidden">
        <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gayatri-600 text-white">
          <span className="material-symbols-outlined text-[18px]">spa</span>
        </span>
        <span className="font-display text-base font-semibold text-gayatri-600">Gayatri</span>
      </div>

      {/* Search */}
      <div className="relative hidden flex-1 md:block">
        <span className="material-symbols-outlined pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[20px] text-charcoal-soft">
          search
        </span>
        <input
          type="search"
          placeholder="Cari data, reservasi, atau pelanggan…"
          className="h-11 w-full max-w-xl rounded-full border border-outline-soft/40 bg-white pl-11 pr-4 text-sm text-charcoal placeholder:text-charcoal-soft/60 focus:border-gayatri-600 focus:outline-none focus:ring-2 focus:ring-gayatri-600/20"
        />
      </div>

      <div className="ml-auto flex items-center gap-1.5">
        <button
          type="button"
          aria-label="Notifikasi"
          className="flex h-10 w-10 items-center justify-center rounded-full text-charcoal-soft transition-colors hover:bg-cream-200 hover:text-charcoal"
        >
          <span className="material-symbols-outlined text-[22px]">notifications</span>
        </button>
        <button
          type="button"
          aria-label="Bantuan"
          className="flex h-10 w-10 items-center justify-center rounded-full text-charcoal-soft transition-colors hover:bg-cream-200 hover:text-charcoal"
        >
          <span className="material-symbols-outlined text-[22px]">help</span>
        </button>
        <div className="mx-1 hidden h-8 w-px bg-outline-soft/30 sm:block" />
        <Button variant="ghost" size="sm" onClick={() => logout.mutate()} disabled={logout.isPending}>
          <span className="material-symbols-outlined text-[18px]">logout</span>
          Keluar
        </Button>
      </div>
    </header>
  )
}
