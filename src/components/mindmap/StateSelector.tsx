import { STATE_CONFIG } from '@/utils/state'
import type { TaskState } from '@/types/node'
import { cn } from '@/utils/cn'

interface StateSelectorProps {
  value: TaskState | null
  onChange: (state: TaskState | null) => void
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  className?: string
}

export function StateSelector({
  value,
  onChange,
  size = 'md',
  disabled = false,
  className
}: StateSelectorProps) {
  const states = Object.keys(STATE_CONFIG) as TaskState[]

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs gap-1',
    md: 'px-3 py-2 text-sm gap-2',
    lg: 'px-4 py-2.5 text-base gap-2.5'
  }

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  }

  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {/* Clear State Option */}
      <button
        onClick={() => onChange(null)}
        disabled={disabled}
        className={cn(
          'flex items-center rounded-lg border-2 transition-all',
          'border-gray-700 hover:border-gray-600',
          'text-gray-400 hover:text-gray-300',
          sizeClasses[size],
          value === null && 'ring-2 ring-primary border-primary',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
        title="No state"
      >
        <span className="font-medium">None</span>
      </button>

      {/* State Options */}
      {states.map((state) => {
        const config = STATE_CONFIG[state]
        const Icon = config.icon
        const isActive = value === state

        return (
          <button
            key={state}
            onClick={() => onChange(state)}
            disabled={disabled}
            className={cn(
              'flex items-center rounded-lg border-2 transition-all',
              `border-${config.color}-900/50 hover:border-${config.color}-700`,
              `text-${config.color}-400`,
              sizeClasses[size],
              isActive && `ring-2 ring-${config.color}-500`,
              disabled && 'opacity-50 cursor-not-allowed'
            )}
            title={config.description}
          >
            <Icon className={cn(iconSizes[size], state === 'in-progress' && 'animate-spin')} />
            <span className="font-medium">{config.label}</span>
          </button>
        )
      })}
    </div>
  )
}
