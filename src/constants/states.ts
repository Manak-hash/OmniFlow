import { Circle, Loader2, Ban, CheckCircle2, XCircle } from 'lucide-react'
import type { TaskState } from '@/types/task'
import type { LucideIcon } from 'lucide-react'

export interface StateConfig {
  icon: LucideIcon
  color: string
  label: string
  weight: number
  description: string
}

/**
 * State configurations for task management
 * Weight determines sorting order (lower weight = higher priority)
 */
export const STATE_CONFIGS: Record<TaskState, StateConfig> = {
  'not-started': {
    icon: Circle,
    color: 'gray',
    label: 'Not Started',
    weight: 1,
    description: 'Task has not been started yet'
  },
  'in-progress': {
    icon: Loader2,
    color: 'blue',
    label: 'In Progress',
    weight: 2,
    description: 'Task is currently being worked on'
  },
  'blocked': {
    icon: Ban,
    color: 'yellow',
    label: 'Blocked',
    weight: 3,
    description: 'Task is blocked or waiting on dependencies'
  },
  'done': {
    icon: CheckCircle2,
    color: 'green',
    label: 'Done',
    weight: 4,
    description: 'Task completed successfully'
  },
  'failed': {
    icon: XCircle,
    color: 'red',
    label: 'Failed',
    weight: 5,
    description: 'Task could not be completed'
  }
} as const

export function getStateConfig(state: TaskState): StateConfig {
  return STATE_CONFIGS[state]
}

export function getStateColor(state: TaskState): string {
  return STATE_CONFIGS[state].color
}

export function getStateLabel(state: TaskState): string {
  return STATE_CONFIGS[state].label
}

export function getStateWeight(state: TaskState): number {
  return STATE_CONFIGS[state].weight
}

export function getStateIcon(state: TaskState): LucideIcon {
  return STATE_CONFIGS[state].icon
}

export function getAllStates(): TaskState[] {
  return Object.keys(STATE_CONFIGS) as TaskState[]
}
