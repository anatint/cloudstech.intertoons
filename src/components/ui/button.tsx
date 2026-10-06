'use client'
import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  // Premium hover treatment shared by every variant: a slight lift + deeper
  // shadow, and a diagonal light-sweep ("shine") that sweeps across on
  // hover via the ::before pseudo-element. `isolate` keeps that pseudo-
  // element's stacking contained to the button, `overflow-hidden` clips the
  // sweep to the rounded shape, and `active:scale` gives a tactile press.
  [
    'relative isolate inline-flex items-center justify-center gap-2 rounded-full text-sm font-semibold',
    'overflow-hidden transition-all duration-300 ease-out',
    'hover:-translate-y-0.5 hover:shadow-xl active:translate-y-0 active:scale-[0.97] active:duration-100',
    'before:absolute before:inset-0 before:-z-10 before:-translate-x-[150%] before:skew-x-12',
    'before:bg-gradient-to-r before:from-transparent before:via-white/30 before:to-transparent',
    'before:transition-transform before:duration-700 before:ease-in-out hover:before:translate-x-[150%]',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600',
    'disabled:pointer-events-none disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-none',
  ].join(' '),
  {
    variants: {
      variant: {
        default: 'bg-brand-600 text-white shadow hover:bg-brand-700 hover:shadow-brand-600/30 active:bg-brand-800',
        outline: 'border-2 border-brand-600 text-brand-600 bg-transparent hover:bg-brand-50',
        ghost: 'text-brand-600 hover:bg-brand-50',
        white: 'bg-white text-brand-700 shadow hover:bg-brand-50',
        destructive: 'bg-red-600 text-white hover:bg-red-700 hover:shadow-red-600/30',
      },
      size: {
        sm: 'h-9 px-4 text-xs',
        default: 'h-11 px-6',
        lg: 'h-13 px-8 text-base',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  },
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
  },
)
Button.displayName = 'Button'

export { Button, buttonVariants }
