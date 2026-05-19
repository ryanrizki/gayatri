'use client'

import * as ToastPrimitive from '@radix-ui/react-toast'
import { createContext, useContext, useState, type ReactNode } from 'react'
import { cn } from '@/lib/cn'

type Toast = { id: number; title: string; description?: string; variant?: 'default' | 'success' | 'error' }
type Ctx = { toast: (t: Omit<Toast, 'id'>) => void }

const ToastCtx = createContext<Ctx | null>(null)

export function useToast() {
  const ctx = useContext(ToastCtx)
  if (!ctx) throw new Error('useToast outside ToastProvider')
  return ctx
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const toast = (t: Omit<Toast, 'id'>) => {
    const id = Date.now() + Math.random()
    setToasts((prev) => [...prev, { ...t, id }])
  }
  const remove = (id: number) => setToasts((p) => p.filter((t) => t.id !== id))

  return (
    <ToastCtx.Provider value={{ toast }}>
      <ToastPrimitive.Provider swipeDirection="right" duration={4000}>
        {children}
        {toasts.map((t) => (
          <ToastPrimitive.Root
            key={t.id}
            onOpenChange={(open) => !open && remove(t.id)}
            className={cn(
              'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out',
              'pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-xl border bg-white p-4 shadow-glow-md',
              t.variant === 'success' && 'border-gayatri-300',
              t.variant === 'error' && 'border-red-300',
              !t.variant && 'border-outline-soft/40'
            )}
          >
            <span
              className={cn(
                'material-symbols-outlined mt-0.5 text-[20px]',
                t.variant === 'success' && 'text-gayatri-600',
                t.variant === 'error' && 'text-red-600',
                !t.variant && 'text-charcoal-soft'
              )}
            >
              {t.variant === 'success' ? 'check_circle' : t.variant === 'error' ? 'error' : 'info'}
            </span>
            <div className="flex-1">
              <ToastPrimitive.Title className="text-sm font-semibold text-charcoal">{t.title}</ToastPrimitive.Title>
              {t.description && (
                <ToastPrimitive.Description className="mt-0.5 text-xs text-charcoal-soft">
                  {t.description}
                </ToastPrimitive.Description>
              )}
            </div>
            <ToastPrimitive.Close className="text-charcoal-soft hover:text-charcoal">
              <span className="material-symbols-outlined text-[18px]">close</span>
            </ToastPrimitive.Close>
          </ToastPrimitive.Root>
        ))}
        <ToastPrimitive.Viewport className="fixed bottom-4 right-4 z-[100] flex w-full max-w-sm flex-col gap-2 outline-none" />
      </ToastPrimitive.Provider>
    </ToastCtx.Provider>
  )
}
