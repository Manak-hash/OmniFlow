import type { Node } from '@/types/node'

/**
 * Generate a consistent color for a tag based on its name
 * @param tag - The tag string
 * @returns Color name from the predefined palette
 */
export function getTagColor(tag: string): string {
  const hash = tag.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  const colors = ['blue', 'purple', 'pink', 'orange', 'teal', 'cyan', 'green', 'yellow']
  return colors[hash % colors.length]
}

/**
 * Extract all unique tags from a list of nodes
 * @param nodes - List of nodes
 * @returns Sorted array of unique tags
 */
export function extractAllTags(nodes: Node[]): string[] {
  const tagSet = new Set<string>()
  nodes.forEach(node => {
    // Safety check: tags might be undefined
    if (node.tags && Array.isArray(node.tags)) {
      node.tags.forEach(tag => tagSet.add(tag))
    }
  })
  return sortTags(Array.from(tagSet))
}

/**
 * Truncate a tag if it's too long
 * @param tag - The tag string
 * @param maxLength - Maximum length before truncation
 * @returns Truncated tag with ellipsis if needed
 */
export function truncateTag(tag: string, maxLength: number = 15): string {
  return tag.length > maxLength ? `${tag.slice(0, maxLength)}...` : tag
}

/**
 * Filter tags by search term
 * @param tags - All available tags
 * @param search - Search term to filter by
 * @returns Filtered tags
 */
export function filterTags(tags: string[], search: string): string[] {
  const searchLower = search.toLowerCase()
  return tags.filter(tag =>
    tag.toLowerCase().includes(searchLower)
  )
}

/**
 * Sort tags alphabetically
 * @param tags - Tags to sort
 * @returns Sorted tags
 */
export function sortTags(tags: string[]): string[] {
  return [...tags].sort((a, b) => a.localeCompare(b))
}

/**
 * Check if a tag is valid (not empty, reasonable length)
 * @param tag - Tag to validate
 * @returns True if valid
 */
export function isValidTag(tag: string): boolean {
  const trimmed = tag.trim()
  return trimmed.length > 0 && trimmed.length <= 50
}

/**
 * Normalize a tag (trim, lowercase, etc.)
 * @param tag - Tag to normalize
 * @returns Normalized tag
 */
export function normalizeTag(tag: string): string {
  return tag.trim().toLowerCase()
}
