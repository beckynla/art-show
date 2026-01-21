import { cn } from '@/lib/utils'

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info'
  children: React.ReactNode
}

export function Badge({ className, variant = 'default', children, ...props }: BadgeProps) {
  const variants = {
    default: 'bg-gray-100 text-gray-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    danger: 'bg-red-100 text-red-800',
    info: 'bg-blue-100 text-blue-800'
  }

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  )
}

// Helper function to get badge variant from order/product status
export function getStatusVariant(status: string): BadgeProps['variant'] {
  const statusMap: Record<string, BadgeProps['variant']> = {
    // Order statuses
    pending: 'warning',
    paid: 'success',
    shipped: 'info',
    delivered: 'success',
    cancelled: 'danger',
    refunded: 'default',
    // Product statuses
    available: 'success',
    sold: 'default',
    reserved: 'warning',
    hidden: 'default'
  }

  return statusMap[status] || 'default'
}
