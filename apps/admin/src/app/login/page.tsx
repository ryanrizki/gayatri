import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { LoginForm } from './login-form'

export const dynamic = 'force-dynamic'

export default async function LoginPage() {
  const token = cookies().get('gayatri_admin')?.value
  if (token) {
    try {
      const apiBase = (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000').replace(/\/+$/, '')
      const res = await fetch(`${apiBase}/v1/admin/auth/me`, {
        headers: { cookie: `gayatri_admin=${token}` },
        cache: 'no-store'
      })
      if (res.ok) redirect('/')
    } catch {
      // fall through to login form
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gayatri-50 via-cream-100 to-peach-100 px-5">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gayatri-600 text-white">
            <span className="material-symbols-outlined">spa</span>
          </div>
          <h1 className="font-display text-3xl font-medium text-gayatri-600">Gayatri Admin</h1>
          <p className="mt-2 text-sm text-charcoal-soft">Masuk untuk mengelola booking dan katalog.</p>
        </div>
        <div className="rounded-2xl border border-outline-soft/30 bg-white p-8 shadow-glow-md">
          <LoginForm />
        </div>
        <p className="mt-6 text-center text-xs text-charcoal-soft">© Gayatri Baby Spa</p>
      </div>
    </main>
  )
}
