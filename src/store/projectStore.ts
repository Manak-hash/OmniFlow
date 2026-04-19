import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { ProjectStore as IProjectStore } from '@/types/store'
import type { Project } from '@/types/project'
import { validateProject } from '@/utils/validation'
import { generateUniqueSlug } from '@/utils/slug'

/**
 * Zustand store for project management with persistence
 */
export const useProjectStore = create<IProjectStore>()(
  persist(
    (set, get) => ({
      projects: new Map(),

      getProject: (id: string) => {
        const state = get()
        return state.projects.get(id)
      },

      getProjectBySlug: (slug: string) => {
        const state = get()
        for (const [, project] of state.projects) {
          if (project.slug === slug) {
            return project
          }
        }
        return null
      },

      getAllProjects: () => {
        const state = get()
        return Array.from(state.projects.values())
      },

      createProject: (projectData) => {
        const state = get()
        const now = new Date().toISOString()
        const id = crypto.randomUUID()
        const slug = generateUniqueSlug(projectData.name, state.projects)

        const newProject: Project = {
          ...projectData,
          id,
          slug,
          createdAt: now,
          updatedAt: now
        }

        // Validate the new project
        const validation = validateProject(newProject)
        if (!validation.valid) {
          throw new Error(`Invalid project: ${validation.errors.join(', ')}`)
        }

        const newProjects = new Map(state.projects)
        newProjects.set(id, newProject)
        set({ projects: newProjects })

        return newProject
      },

      updateProject: (id: string, changes: Partial<Omit<Project, 'id' | 'slug' | 'createdAt' | 'updatedAt'>>) => {
        const state = get()
        const existing = state.projects.get(id)

        if (!existing) {
          throw new Error(`Project with id ${id} not found`)
        }

        // Update slug if name changes
        let slug = existing.slug
        if (changes.name && changes.name !== existing.name) {
          slug = generateUniqueSlug(changes.name, state.projects, id)
        }

        const updated: Project = {
          ...existing,
          ...changes,
          slug,
          id, // Ensure ID cannot be changed
          updatedAt: new Date().toISOString()
        }

        // Validate the updated project
        const validation = validateProject(updated)
        if (!validation.valid) {
          throw new Error(`Invalid project: ${validation.errors.join(', ')}`)
        }

        const newProjects = new Map(state.projects)
        newProjects.set(id, updated)
        set({ projects: newProjects })
      },

      deleteProject: (id: string) => {
        const state = get()
        const project = state.projects.get(id)

        if (!project) {
          throw new Error(`Project with id ${id} not found`)
        }

        const newProjects = new Map(state.projects)
        newProjects.delete(id)
        set({ projects: newProjects })
      }
    }),
    {
      name: 'omniflow-projects',
      partialize: (state) => ({
        projects: Array.from(state.projects.entries())
      }),
      merge: (persistedState: any, currentState) => ({
        ...currentState,
        projects: new Map(persistedState.projects || [])
      })
    }
  )
)
