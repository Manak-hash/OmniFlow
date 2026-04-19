/**
 * Generate a URL-friendly slug from a string
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
    .substring(0, 50) // Limit length
}

/**
 * Check if a slug is unique among existing projects
 */
export function isSlugUnique(slug: string, existingProjects: Map<string, any>, excludeId?: string): boolean {
  for (const [, project] of existingProjects) {
    if (project.slug === slug && project.id !== excludeId) {
      return false
    }
  }
  return true
}

/**
 * Generate a unique slug by appending a number if needed
 */
export function generateUniqueSlug(name: string, existingProjects: Map<string, any>, excludeId?: string): string {
  let baseSlug = generateSlug(name)
  let slug = baseSlug
  let counter = 1

  while (!isSlugUnique(slug, existingProjects, excludeId)) {
    slug = `${baseSlug}-${counter}`
    counter++
  }

  return slug
}
