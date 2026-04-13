import type { Node } from '@/types/node'

export interface FilterState {
  searchQuery: string
  selectedTags: string[]
  selectedPriorities: string[]
  selectedAssignees: string[]
  overdueOnly: boolean
}

/**
 * Filter nodes based on filter state
 */
export function filterNodes(nodes: Node[], filters: FilterState): Node[] {
  return nodes.filter(node => {
    // Search query
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase()
      const matchesSearch =
        node.title.toLowerCase().includes(query) ||
        node.content.toLowerCase().includes(query) ||
        node.tags.some(tag => tag.toLowerCase().includes(query))
      if (!matchesSearch) return false
    }

    // Tags filter
    if (filters.selectedTags.length > 0) {
      const hasTag = filters.selectedTags.some(tag => node.tags.includes(tag))
      if (!hasTag) return false
    }

    // Priority filter
    if (filters.selectedPriorities.length > 0) {
      if (!node.priority || !filters.selectedPriorities.includes(node.priority)) {
        return false
      }
    }

    // Assignee filter
    if (filters.selectedAssignees.length > 0) {
      const hasAssignee = filters.selectedAssignees.some(a =>
        node.assignees.includes(a)
      )
      if (!hasAssignee) return false
    }

    // Overdue filter
    if (filters.overdueOnly) {
      if (!node.dueDate) return false
      const now = new Date()
      const due = new Date(node.dueDate)
      if (due > now) return false
    }

    return true
  })
}

/**
 * Extract all unique tags from nodes
 */
export function extractAllTags(nodes: Node[]): string[] {
  const tags = new Set<string>()
  nodes.forEach(node => {
    node.tags.forEach(tag => tags.add(tag))
  })
  return Array.from(tags).sort()
}

/**
 * Extract all unique assignees from nodes
 */
export function extractAllAssignees(nodes: Node[]): string[] {
  const assignees = new Set<string>()
  nodes.forEach(node => {
    node.assignees.forEach(assignee => assignees.add(assignee))
  })
  return Array.from(assignees).sort()
}

/**
 * Group nodes by a field (for swimlanes)
 */
export type GroupByField = 'tag' | 'priority' | 'assignee' | 'dueDate'

export interface SwimlaneGroup {
  key: string
  label: string
  nodes: Node[]
  color?: string
}

export function groupNodesByField(
  nodes: Node[],
  field: GroupByField
): SwimlaneGroup[] {
  const groups = new Map<string, Node[]>()

  nodes.forEach(node => {
    let key: string

    switch (field) {
      case 'tag':
        key = node.tags[0] || 'untagged'
        break
      case 'priority':
        key = node.priority || 'unassigned'
        break
      case 'assignee':
        key = node.assignees[0] || 'unassigned'
        break
      case 'dueDate':
        if (!node.dueDate) {
          key = 'no-due-date'
        } else {
          const now = new Date()
          const due = new Date(node.dueDate)
          const daysUntil = Math.floor((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

          if (daysUntil < 0) key = 'overdue'
          else if (daysUntil === 0) key = 'today'
          else if (daysUntil <= 2) key = 'this-week'
          else if (daysUntil <= 7) key = 'next-week'
          else key = 'later'
        }
        break
      default:
        key = 'all'
    }

    if (!groups.has(key)) {
      groups.set(key, [])
    }
    groups.get(key)!.push(node)
  })

  return Array.from(groups.entries()).map(([key, nodes]) => ({
    key,
    label: formatGroupLabel(field, key),
    nodes
  }))
}

function formatGroupLabel(field: GroupByField, key: string): string {
  switch (field) {
    case 'priority':
      return key === 'unassigned' ? 'No Priority' : key.charAt(0).toUpperCase() + key.slice(1)
    case 'assignee':
      return key === 'unassigned' ? 'Unassigned' : key
    case 'dueDate':
      const dueDateLabels: Record<string, string> = {
        'overdue': 'Overdue',
        'today': 'Due Today',
        'this-week': 'This Week',
        'next-week': 'Next Week',
        'later': 'Later',
        'no-due-date': 'No Due Date'
      }
      return dueDateLabels[key] || key
    case 'tag':
      return key === 'untagged' ? 'Untagged' : key
    default:
      return key
  }
}
