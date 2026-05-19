'use client'

import { QueryClientProvider } from '@tanstack/react-query'
import { useState, type ReactNode } from 'react'
import { makeQueryClient } from '@/lib/queryClient'
import { ToastProvider } from '@/components/ui/toast'

export function Providers({ children }: { children: ReactNode }) {
  const [client] = useState(() => makeQueryClient())
  return (
    <QueryClientProvider client={client}>
      <ToastProvider>{children}</ToastProvider>
    </QueryClientProvider>
  )
}
