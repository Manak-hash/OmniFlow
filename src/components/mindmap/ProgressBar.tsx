import { motion } from 'framer-motion'
import { cn } from '@/utils/cn'

interface ProgressBarProps {
  current: number
  target: number
  size?: 'sm' | 'md' | 'lg'
  showPercentage?: boolean
  showNumbers?: boolean
  className?: string
}

export function ProgressBar({
  current,
  target,
  size = 'md',
  showPercentage = true,
  showNumbers = true,
  className
}: ProgressBarProps) {
  const percentage = target > 0 ? Math.min(100, Math.max(0, (current / target) * 100)) : 0

  // Enhanced color determination with gradients
  const getColorStyles = () => {
    if (percentage < 25) {
      return {
        bg: 'from-gray-600 to-gray-700',
        glow: 'shadow-gray-500/20'
      }
    }
    if (percentage < 50) {
      return {
        bg: 'from-yellow-600 to-yellow-700',
        glow: 'shadow-yellow-500/20'
      }
    }
    if (percentage < 75) {
      return {
        bg: 'from-blue-600 to-blue-700',
        glow: 'shadow-blue-500/20'
      }
    }
    return {
      bg: 'from-green-600 to-green-700',
      glow: 'shadow-green-500/20'
    }
  }

  const colorStyles = getColorStyles()
  const heightMap = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3'
  }

  return (
    <div className={cn('w-full', className)}>
      {/* Header with numbers and percentage */}
      {(showNumbers || showPercentage) && (
        <div className="flex justify-between items-center mb-1.5">
          {showNumbers && (
            <motion.span
              className="text-xs font-mono font-bold text-text-secondary"
              animate={{
                color: percentage === 100 ? ['#4ade80', '#22c55e'] : ['#6b7280', '#6b7280']
              }}
              transition={{ duration: 0.5 }}
            >
              {current}/{target}
            </motion.span>
          )}
          {showPercentage && (
            <motion.span
              className={cn(
                'text-xs font-mono font-bold',
                percentage === 100 ? 'text-green-400' : 'text-text-tertiary'
              )}
              animate={{
                scale: percentage === 100 ? [1, 1.1, 1] : 1
              }}
              transition={{ duration: 0.3 }}
            >
              {percentage.toFixed(0)}%
            </motion.span>
          )}
        </div>
      )}

      {/* Enhanced progress bar with gradient and glow */}
      <div className={cn(
        'relative w-full bg-gray-700/50 rounded-full overflow-hidden',
        heightMap[size],
        'shadow-inner'
      )}>
        {/* Animated background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="w-full h-full" style={{
            backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 2px, rgba(255,255,255,0.1) 2px, rgba(255,255,255,0.1) 4px)',
          }} />
        </div>

        {/* Progress fill with gradient and animation */}
        <motion.div
          className={cn(
            'h-full rounded-full bg-gradient-to-r',
            colorStyles.bg,
            'relative overflow-hidden'
          )}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{
            type: "spring",
            stiffness: 100,
            damping: 15,
            mass: 1
          }}
        >
          {/* Shimmer effect */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
            animate={{
              x: ['-100%', '200%']
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "linear"
            }}
          />

          {/* Glow effect */}
          <div className={cn(
            'absolute inset-0 blur-sm',
            colorStyles.glow
          )} />
        </motion.div>

        {/* Completion celebration effect */}
        {percentage === 100 && (
          <motion.div
            className="absolute inset-0 bg-green-500/20"
            initial={{ opacity: 0 }}
            animate={{
              opacity: [0, 0.5, 0],
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        )}
      </div>

      {/* Milestone markers */}
      {size === 'lg' && (
        <div className="flex justify-between mt-1">
          {[0, 25, 50, 75, 100].map((milestone) => (
            <motion.div
              key={milestone}
              className={cn(
                'w-1 h-1 rounded-full',
                percentage >= milestone ? 'bg-text-tertiary' : 'bg-gray-700'
              )}
              animate={{
                scale: percentage >= milestone ? [1, 1.2, 1] : 1
              }}
              transition={{
                delay: milestone * 0.01,
                duration: 0.3
              }}
            />
          ))}
        </div>
      )}
    </div>
  )
}
