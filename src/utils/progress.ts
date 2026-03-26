/**
 * Calculate progress percentage
 * @param current - Current progress value
 * @param target - Target value (null means no target set)
 * @returns Progress percentage (0-100)
 */
export function calculateProgress(current: number, target: number | null): number {
  if (!target || target === 0) return 0
  return Math.min(100, Math.max(0, (current / target) * 100))
}

/**
 * Get color class for progress bar based on percentage
 * @param percentage - Progress percentage (0-100)
 * @returns Tailwind color class
 */
export function getProgressColor(percentage: number): string {
  if (percentage < 25) return 'bg-gray-600'
  if (percentage < 50) return 'bg-yellow-600'
  if (percentage < 75) return 'bg-blue-600'
  return 'bg-green-600'
}

/**
 * Format progress as text (e.g., "3/12 mushrooms")
 * @param current - Current progress value
 * @param target - Target value
 * @param label - Optional label for the unit
 * @returns Formatted progress string
 */
export function formatProgress(
  current: number,
  target: number | null,
  label?: string
): string {
  if (!target) return `${current}`
  const formattedLabel = label ? ` ${label}` : ''
  return `${current}/${target}${formattedLabel}`
}

/**
 * Validate progress values
 * @param current - Current progress value
 * @param target - Target value
 * @returns Error message if invalid, null if valid
 */
export function validateProgress(
  current: number,
  target: number | null
): string | null {
  if (current < 0) {
    return 'Current progress cannot be negative'
  }
  if (target !== null && target < 0) {
    return 'Target cannot be negative'
  }
  if (target !== null && current > target) {
    return 'Current progress cannot exceed target'
  }
  return null
}
