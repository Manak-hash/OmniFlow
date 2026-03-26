import { Circle, Loader2, Ban, CheckCircle2, XCircle } from 'lucide-react'
import type { TaskState } from '@/types/node'
import type { LucideIcon } from 'lucide-react'

export interface StateConfig {
  color: string
  icon: LucideIcon
  label: string
  description: string
}

export const STATE_CONFIG: Record<TaskState, StateConfig> = {
  'not-started': {
    color: 'gray',
    icon: Circle,
    label: 'Not Started',
    description: 'Task has not been started yet'
  },
  'in-progress': {
    color: 'blue',
    icon: Loader2,
    label: 'In Progress',
    description: 'Task is currently being worked on'
  },
  'stopped': {
    color: 'yellow',
    icon: Ban,
    label: 'Stopped',
    description: 'Task has been paused or blocked'
  },
  'finished-success': {
    color: 'green',
    icon: CheckCircle2,
    label: 'Done',
    description: 'Task completed successfully'
  },
  'finished-failure': {
    color: 'red',
    icon: XCircle,
    label: 'Failed',
    description: 'Task could not be completed'
  }
} as const

export function getStateConfig(state: TaskState): StateConfig {
  return STATE_CONFIG[state]
}

export function getStateColor(state: TaskState): string {
  return STATE_CONFIG[state].color
}

export function getStateLabel(state: TaskState): string {
  return STATE_CONFIG[state].label
}
