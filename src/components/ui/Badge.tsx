import React from 'react'
import { cn } from '@/lib/utils'

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning'
  size?: 'sm' | 'md' | 'lg'
  children: React.ReactNode
}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant = 'default', size = 'md', children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'inline-flex items-center rounded-full font-medium transition-colors',
          // Variant styles
          {
            'bg-primary-600 text-white': variant === 'default',
            'bg-gray-200 text-gray-800': variant === 'secondary',
            'bg-red-600 text-white': variant === 'destructive',
            'border border-gray-300 text-gray-700 bg-white': variant === 'outline',
            'bg-green-600 text-white': variant === 'success',
            'bg-yellow-600 text-white': variant === 'warning',
          },
          // Size styles
          {
            'px-2 py-0.5 text-xs': size === 'sm',
            'px-2.5 py-1 text-sm': size === 'md',
            'px-3 py-1.5 text-base': size === 'lg',
          },
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)
Badge.displayName = 'Badge'

export { Badge } 