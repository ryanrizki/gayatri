import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { Sidebar } from '@/components/shell/Sidebar'
import { Topbar } from '@/components/shell/Topbar'

export const dynamic = 'force-dynamic'

type Me = { sub: string; email: string; role: 'OWNER' | 'ADMIN' | 'STAFF' }

async function getMe(): Promise<Me | null> {
  const token = cookies().get('gayatri_admin')?.value
  if (!token) return null
  try {
    const apiBase = (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000').replace(/\/+$/, '')
    const res = await fetch(`${apiBase}/v1/admin/auth/me`, {
      headers: { cookie: `gayatri_admin=${token}` },
      cache: 'no-store'
    })
    if (!res.ok) return null
    return (await res.json()) as Me
  } catch {
    return null
  }
}

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const me = await getMe()
  if (!me) redirect('/login')

  return (
    <div className="flex min-h-screen bg-cream-100">
      <Sidebar user={{ email: me.email, role: me.role }} />
      <div className="flex flex-1 flex-col lg:pl-64">
        <Topbar user={{ email: me.email, role: me.role }} />
        <main className="flex-1 p-4 md:p-8">{children}</main>
      </div>
    </div>
  )
}
