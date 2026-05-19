import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { cn } from '@/lib/cn'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-full font-semibold tracking-wide transition-all active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gayatri-600/30',
  {
    variants: {
      variant: {
        primary: 'bg-gayatri-600 text-white hover:opacity-90',
        secondary: 'border border-outline-soft/40 bg-white text-charcoal hover:border-gayatri-600 hover:text-gayatri-600',
        ghost: 'text-charcoal-soft hover:bg-cream-200 hover:text-charcoal',
        danger: 'bg-red-600 text-white hover:opacity-90',
        link: 'text-gayatri-600 underline-offset-4 hover:underline px-0'
      },
      size: {
        sm: 'h-9 px-4 text-xs',
        md: 'h-11 px-6 text-sm',
        lg: 'h-12 px-7 text-sm',
        icon: 'h-9 w-9 p-0'
      }
    },
    defaultVariants: { variant: 'primary', size: 'md' }
  }
)

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return <Comp className={cn(buttonVariants({ variant, size }), className)} ref={ref} {...props} />
  }
)
Button.displayName = 'Button'

export { buttonVariants }
