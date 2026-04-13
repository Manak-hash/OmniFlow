import { useMemo } from 'react'
import { ProjectCard } from './ProjectCard'
import { useProjectStore } from '@/store/projectStore'
import { useTaskStore } from '@/store/taskStore'
import { cn } from '@/utils/cn'

interface ProjectGridProps {
  onProjectClick: (projectId: string) => void
  className?: string
}

export function ProjectGrid({ onProjectClick, className }: ProjectGridProps) {
  const getAllProjects = useProjectStore((state) => state.getAllProjects)
  const getTasksByProject = useTaskStore((state) => state.getTasksByProject)

  // Get all projects
  const projects = useMemo(() => {
    return getAllProjects()
  }, [getAllProjects])

  // Calculate stats for each project
  const projectStats = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    return projects.map(project => {
      const tasks = getTasksByProject(project.id)

      const inProgressCount = tasks.filter(t => t.state === 'in-progress').length

      // Count tasks due today
      const dueTodayCount = tasks.filter(t => {
        if (!t.dueDate) return false
        const dueDate = new Date(t.dueDate)
        dueDate.setHours(0, 0, 0, 0)
        return dueDate.getTime() === today.getTime()
      }).length

      return {
        project,
        taskCount: tasks.length,
        inProgressCount,
        dueTodayCount
      }
    })
  }, [projects, getTasksByProject])

  // Sort projects: most recently updated first
  const sortedProjectStats = useMemo(() => {
    return [...projectStats].sort((a, b) => {
      return new Date(b.project.updatedAt).getTime() - new Date(a.project.updatedAt).getTime()
    })
  }, [projectStats])

  if (projects.length === 0) {
    return (
      <div className={cn('text-center py-12', className)}>
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-omni-bg-secondary flex items-center justify-center">
          <svg className="w-8 h-8 text-omni-text/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-omni-text mb-2">No projects yet</h3>
        <p className="text-omni-text-secondary text-sm">
          Create your first project to get started
        </p>
      </div>
    )
  }

  return (
    <div className={cn('grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4', className)}>
      {sortedProjectStats.map(({ project, taskCount, inProgressCount, dueTodayCount }) => (
        <ProjectCard
          key={project.id}
          project={project}
          taskCount={taskCount}
          inProgressCount={inProgressCount}
          dueTodayCount={dueTodayCount}
          onClick={() => onProjectClick(project.id)}
        />
      ))}
    </div>
  )
}
