import type { TaskPriority } from '@/types/node'
import { AlertTriangle, ArrowUp, ArrowRight, Minus } from 'lucide-react'

export interface PriorityConfig {
  value: TaskPriority
  label: string
  color: string
  bgColor: string
  borderColor: string
  icon: React.ComponentType<{ className?: string }>
  weight: number // For sorting
}

export const PRIORITY_CONFIG: Record<string, PriorityConfig> = {
  critical: {
    value: 'critical',
    label: 'Critical',
    color: 'text-red-400',
    bgColor: 'bg-red-900/30',
    borderColor: 'border-red-500',
    icon: AlertTriangle,
    weight: 4
  },
  high: {
    value: 'high',
    label: 'High',
    color: 'text-orange-400',
    bgColor: 'bg-orange-900/30',
    borderColor: 'border-orange-500',
    icon: ArrowUp,
    weight: 3
  },
  medium: {
    value: 'medium',
    label: 'Medium',
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-900/30',
    borderColor: 'border-yellow-500',
    icon: ArrowRight,
    weight: 2
  },
  low: {
    value: 'low',
    label: 'Low',
    color: 'text-gray-400',
    bgColor: 'bg-gray-900/30',
    borderColor: 'border-gray-500',
    icon: Minus,
    weight: 1
  }
}

export const PRIORITIES: TaskPriority[] = ['critical', 'high', 'medium', 'low', null]

/**
 * Get priority configuration
 */
export function getPriorityConfig(priority: TaskPriority): PriorityConfig | null {
  if (!priority) return null
  return PRIORITY_CONFIG[priority] || null
}

/**
 * Get priority color class
 */
export function getPriorityColor(priority: TaskPriority): string {
  const config = getPriorityConfig(priority)
  return config?.color || 'text-gray-400'
}

/**
 * Get priority border color class
 */
export function getPriorityBorderColor(priority: TaskPriority): string {
  const config = getPriorityConfig(priority)
  return config?.borderColor || 'border-gray-500'
}

/**
 * Sort nodes by priority (highest first)
 */
export function sortByPriority<T extends { priority: TaskPriority }>(nodes: T[]): T[] {
  return [...nodes].sort((a, b) => {
    const aWeight = getPriorityConfig(a.priority)?.weight || 0
    const bWeight = getPriorityConfig(b.priority)?.weight || 0
    return bWeight - aWeight
  })
}

/**
 * Get next priority level (for quick cycling)
 */
export function getNextPriority(current: TaskPriority | null): TaskPriority {
  const priorities: TaskPriority[] = ['low', 'medium', 'high', 'critical']
  const currentIndex = current ? priorities.indexOf(current) : -1
  const nextIndex = (currentIndex + 1) % priorities.length
  return priorities[nextIndex]
}
