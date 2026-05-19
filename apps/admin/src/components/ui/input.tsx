import { forwardRef, type InputHTMLAttributes, type TextareaHTMLAttributes } from 'react'
import { cn } from '@/lib/cn'

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        'w-full rounded-xl border border-outline-soft/40 bg-white px-4 py-2.5 text-sm text-charcoal placeholder:text-charcoal-soft/50 focus:border-gayatri-600 focus:outline-none focus:ring-2 focus:ring-gayatri-600/20 disabled:opacity-50',
        className
      )}
      {...props}
    />
  )
)
Input.displayName = 'Input'

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        'w-full resize-y rounded-xl border border-outline-soft/40 bg-white px-4 py-2.5 text-sm text-charcoal placeholder:text-charcoal-soft/50 focus:border-gayatri-600 focus:outline-none focus:ring-2 focus:ring-gayatri-600/20 disabled:opacity-50',
        className
      )}
      {...props}
    />
  )
)
Textarea.displayName = 'Textarea'
