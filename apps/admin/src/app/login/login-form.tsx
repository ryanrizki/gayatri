'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { AdminLogin } from '@gayatri/types'
import { useMutation } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { adminApi } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/components/ui/toast'

type FormValues = { email: string; password: string }

export function LoginForm() {
  const router = useRouter()
  const { toast } = useToast()
  const form = useForm<FormValues>({
    resolver: zodResolver(AdminLogin),
    defaultValues: { email: '', password: '' }
  })

  const mutation = useMutation({
    mutationFn: async (body: FormValues) => {
      const result = await adminApi<{ token: string; user: { email: string; role: string } }>(
        '/admin/auth/login',
        { method: 'POST', body }
      )
      // The API's cookie is scoped to its own origin (cross-site). Mirror the token
      // into a Next.js-domain cookie so the SSR layout in apps/admin can read it.
      await fetch('/api/auth/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: result.token })
      })
      return result
    },
    onSuccess: () => {
      toast({ variant: 'success', title: 'Berhasil masuk' })
      router.replace('/')
      router.refresh()
    },
    onError: (e: Error) => {
      toast({ variant: 'error', title: 'Login gagal', description: e.message })
    }
  })

  return (
    <form onSubmit={form.handleSubmit((v) => mutation.mutate(v))} className="space-y-4">
      <div>
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" autoComplete="email" {...form.register('email')} />
        {form.formState.errors.email && (
          <p className="mt-1 text-xs text-red-600">{form.formState.errors.email.message}</p>
        )}
      </div>
      <div>
        <Label htmlFor="password">Password</Label>
        <Input id="password" type="password" autoComplete="current-password" {...form.register('password')} />
        {form.formState.errors.password && (
          <p className="mt-1 text-xs text-red-600">{form.formState.errors.password.message}</p>
        )}
      </div>
      <Button type="submit" className="w-full" disabled={mutation.isPending}>
        {mutation.isPending ? (
          <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
        ) : (
          <span className="material-symbols-outlined text-[18px]">login</span>
        )}
        Masuk
      </Button>
    </form>
  )
}
