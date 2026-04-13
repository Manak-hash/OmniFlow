/**
 * Project interface for grouping related tasks
 */
export interface Project {
  id: string;
  name: string;
  description?: string;
  color?: string;
  createdAt: string;
  updatedAt: string;
}
