export type DueDateStatus = 'overdue' | 'due-soon' | 'due-today' | 'on-track' | null

export interface DueDateInfo {
  status: DueDateStatus
  text: string
  color: string
  daysUntil: number | null
}

/**
 * Calculate due date status and display text
 */
export function getDueDateInfo(dueDate: string | null): DueDateInfo {
  if (!dueDate) {
    return { status: null, text: '', color: '', daysUntil: null }
  }

  const now = new Date()
  const due = new Date(dueDate)
  const daysUntil = Math.floor((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

  if (daysUntil < 0) {
    return {
      status: 'overdue',
      text: `${Math.abs(daysUntil)}d overdue`,
      color: 'text-red-400',
      daysUntil
    }
  } else if (daysUntil === 0) {
    return {
      status: 'due-today',
      text: 'Due today',
      color: 'text-orange-400',
      daysUntil
    }
  } else if (daysUntil <= 2) {
    return {
      status: 'due-soon',
      text: daysUntil === 1 ? 'Tomorrow' : `${daysUntil}d left`,
      color: 'text-yellow-400',
      daysUntil
    }
  } else if (daysUntil <= 7) {
    return {
      status: 'on-track',
      text: due.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
      color: 'text-omni-text-tertiary',
      daysUntil
    }
  } else {
    return {
      status: 'on-track',
      text: due.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      color: 'text-omni-text-tertiary',
      daysUntil
    }
  }
}

/**
 * Check if a task is overdue
 */
export function isOverdue(dueDate: string | null): boolean {
  if (!dueDate) return false
  const info = getDueDateInfo(dueDate)
  return info.status === 'overdue'
}

/**
 * Check if a task is due soon (within 2 days)
 */
export function isDueSoon(dueDate: string | null): boolean {
  if (!dueDate) return false
  const info = getDueDateInfo(dueDate)
  return info.status === 'due-soon' || info.status === 'due-today'
}

/**
 * Format due date for display in date picker
 */
export function formatDueDateForInput(dueDate: string | null): string {
  if (!dueDate) return ''
  const date = new Date(dueDate)
  return date.toISOString().split('T')[0] // YYYY-MM-DD format
}

/**
 * Parse due date from input
 */
export function parseDueDateFromInput(dateString: string): string | null {
  if (!dateString) return null
  const date = new Date(dateString)
  if (isNaN(date.getTime())) return null
  return date.toISOString()
}
