import type { Task } from '@/types/task'
import type { Project } from '@/types/project'

export interface ValidationResult {
  valid: boolean
  errors: string[]
}

/**
 * Validates a task object
 * @param task - The task to validate
 * @param allTasks - All tasks in the system (for circular reference and parent existence checks)
 * @returns Validation result with valid flag and array of error messages
 */
export function validateTask(task: Task, allTasks: Task[]): ValidationResult {
  const errors: string[] = []

  // Title validation
  if (!task.title || task.title.trim().length === 0) {
    errors.push('Title is required')
  } else if (task.title.length > 500) {
    errors.push('Title must not exceed 500 characters')
  }

  // Description validation
  if (task.description && task.description.length > 10000) {
    errors.push('Description must not exceed 10000 characters')
  }

  // Circular reference validation - REMOVED to allow any nesting level
  // Users can create any hierarchy they want without restrictions

  // Basic check: prevent task from being its own parent (would create infinite loop)
  if (task.parentId === task.id) {
    errors.push('Task cannot be its own parent')
  }

  // Parent existence validation
  if (task.parentId) {
    const parentExists = allTasks.some(t => t.id === task.parentId)
    if (!parentExists) {
      errors.push('Parent task does not exist')
    }
  }

  return {
    valid: errors.length === 0,
    errors
  }
}

/**
 * Validates a project object
 * @param project - The project to validate
 * @returns Validation result with valid flag and array of error messages
 */
export function validateProject(project: Project): ValidationResult {
  const errors: string[] = []

  // Name validation
  if (!project.name || project.name.trim().length === 0) {
    errors.push('Name is required')
  } else if (project.name.length > 500) {
    errors.push('Name must not exceed 500 characters')
  }

  // Description validation
  if (project.description && project.description.length > 10000) {
    errors.push('Description must not exceed 10000 characters')
  }

  // Color validation (optional field)
  if (project.color) {
    const hexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/
    if (!hexColorRegex.test(project.color)) {
      errors.push('Color must be a valid hex color code')
    }
  }

  return {
    valid: errors.length === 0,
    errors
  }
}
