/**
 * Project interface for grouping related tasks
 */
export interface Project {
  id: string;
  slug: string; // URL-friendly identifier derived from name
  name: string;
  description?: string;
  color?: string;
  createdAt: string;
  updatedAt: string;
}
