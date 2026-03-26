import { motion } from 'framer-motion'
import { Hash } from 'lucide-react'
import { cn } from '@/utils/cn'
import { getTagColor, truncateTag } from '@/utils/tags'

interface TagBadgeProps {
  tag: string
  size?: 'sm' | 'md' | 'lg'
  showIcon?: boolean
  interactive?: boolean
  className?: string
  onClick?: () => void
}

export function TagBadge({
  tag,
  size = 'sm',
  showIcon = false,
  interactive = false,
  className,
  onClick
}: TagBadgeProps) {
  const color = getTagColor(tag)
  const truncatedTag = truncateTag(tag)

  // Enhanced color gradients for tags
  const colorGradients: Record<string, string> = {
    blue: 'from-blue-600 to-blue-700',
    purple: 'from-purple-600 to-purple-700',
    pink: 'from-pink-600 to-pink-700',
    orange: 'from-orange-600 to-orange-700',
    teal: 'from-teal-600 to-teal-700',
    cyan: 'from-cyan-600 to-cyan-700',
    green: 'from-green-600 to-green-700',
    yellow: 'from-yellow-600 to-yellow-700',
    red: 'from-red-600 to-red-700',
  }

  const gradient = colorGradients[color] || colorGradients.blue

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base'
  }

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5',
    lg: 'w-4 h-4'
  }

  const Component = interactive ? motion.button : motion.div

  return (
    <Component
      onClick={onClick}
      whileHover={interactive ? {
        scale: 1.05,
        transition: { type: "spring", stiffness: 400, damping: 10 }
      } : {}}
      whileTap={interactive ? {
        scale: 0.95,
        transition: { type: "spring", stiffness: 600, damping: 15 }
      } : {}}
      className={cn(
        'relative inline-flex items-center gap-1.5 rounded-full font-medium',
        'bg-gradient-to-r',
        gradient,
        'text-white',
        'shadow-lg hover:shadow-xl',
        'border border-white/10',
        'overflow-hidden',
        'transition-all duration-200',
        sizeClasses[size],
        interactive && 'cursor-pointer',
        className
      )}
      title={tag}
    >
      {/* Animated shimmer effect */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
        animate={{
          x: ['-100%', '200%']
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "linear"
        }}
      />

      {/* Inner glow effect */}
      <div className="absolute inset-0 bg-white/10 blur-sm" />

      {/* Content */}
      <div className="relative flex items-center gap-1.5">
        {showIcon && (
          <Hash className={cn('opacity-70', iconSizes[size])} />
        )}
        <span className="truncate max-w-[100px]">{truncatedTag}</span>
      </div>

      {/* Sparkle effect on hover */}
      {interactive && (
        <motion.div
          className="absolute inset-0 bg-white/20"
          initial={{ opacity: 0 }}
          whileHover={{ opacity: [0, 0.3, 0] }}
          transition={{ duration: 0.5 }}
        />
      )}
    </Component>
  )
}
