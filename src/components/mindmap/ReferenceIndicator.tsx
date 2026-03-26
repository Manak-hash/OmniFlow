import { Link } from 'lucide-react'
import { cn } from '@/utils/cn'

interface ReferenceIndicatorProps {
  count: number
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function ReferenceIndicator({
  count,
  size = 'sm',
  className
}: ReferenceIndicatorProps) {
  const sizeClasses = {
    sm: 'text-xs gap-1',
    md: 'text-sm gap-1.5',
    lg: 'text-base gap-2'
  }

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5',
    lg: 'w-4 h-4'
  }

  const badgeSizes = {
    sm: 'px-1.5 py-0.5 text-xs',
    md: 'px-2 py-0.5 text-sm',
    lg: 'px-2.5 py-1 text-base'
  }

  return (
    <div
      className={cn(
        'inline-flex items-center text-gray-400',
        sizeClasses[size],
        className
      )}
      title={`${count} reference${count !== 1 ? 's' : ''}`}
    >
      <Link className={iconSizes[size]} />
      <span className={cn(
        'bg-gray-700 rounded-full',
        badgeSizes[size]
      )}>
        {count}
      </span>
    </div>
  )
}
