import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { ProjectStore as IProjectStore } from '@/types/store'
import type { Project } from '@/types/project'
import { validateProject } from '@/utils/validation'

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

      getAllProjects: () => {
        const state = get()
        return Array.from(state.projects.values())
      },

      createProject: (projectData) => {
        const state = get()
        const now = new Date().toISOString()
        const id = crypto.randomUUID()

        const newProject: Project = {
          ...projectData,
          id,
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

      updateProject: (id: string, changes: Partial<Omit<Project, 'id' | 'createdAt' | 'updatedAt'>>) => {
        const state = get()
        const existing = state.projects.get(id)

        if (!existing) {
          throw new Error(`Project with id ${id} not found`)
        }

        const updated: Project = {
          ...existing,
          ...changes,
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
