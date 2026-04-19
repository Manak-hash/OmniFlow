import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ProjectGrid } from '@/components/projects/ProjectGrid'
import { TodayFocus } from '@/components/projects/TodayFocus'
import { CreateProjectModal } from '@/components/projects/CreateProjectModal'
import { MobileNav } from '@/components/layout/MobileNav'
import { AppSwitcher } from '@/components/navigation/AppSwitcher'
import { Plus, Search, Settings, FolderOpen } from 'lucide-react'
import { useProjectStore } from '@/store/projectStore'
import { cn } from '@/utils/cn'

export default function HomePage() {
  const navigate = useNavigate()
  const getAllProjects = useProjectStore((state) => state.getAllProjects)
  const [searchQuery, setSearchQuery] = useState('')
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [projects, setProjects] = useState(getAllProjects())

  // Update projects when store changes
  useEffect(() => {
    setProjects(getAllProjects())
  }, [getAllProjects])

  const handleCreateProject = () => {
    setIsCreateModalOpen(true)
  }

  const handleProjectCreated = (projectId: string) => {
    navigate(`/project/${projectId}`)
  }

  const handleProjectClick = (projectId: string) => {
    navigate(`/project/${projectId}`)
  }

  const hasProjects = projects.length > 0

  return (
    <div className="min-h-screen bg-omni-bg pb-safe lg:pb-0">
      {/* Header */}
      <div className="border-b border-omni-border bg-omni-bg-secondary/30 safe-area-inset-top">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-6 overflow-x-hidden">
          <div className="flex items-center justify-between gap-4 min-w-0">
            {/* Left side - Logo text */}
            <div className="font-black text-3xl tracking-tighter text-omni-text font-mono leading-none whitespace-nowrap overflow-hidden flex-shrink-0">
              OMNI<span className="text-omni-primary neon-text">FLOW</span>
            </div>

            {/* Right side actions */}
            <div className="flex items-center gap-3 flex-shrink-0">
              {/* Search */}
              <div className="relative hidden sm:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-omni-text-tertiary" />
                <input
                  type="text"
                  placeholder="Search projects..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={cn(
                    'w-64 pl-9 pr-4 py-2 bg-omni-bg border border-omni-border rounded-lg text-sm',
                    'text-omni-text placeholder:text-omni-text-tertiary',
                    'focus:outline-none focus:border-omni-primary focus:ring-1 focus:ring-omni-primary/20',
                    'transition-all'
                  )}
                />
              </div>

              {/* New Project Button */}
              <button
                onClick={handleCreateProject}
                className="flex items-center gap-2 px-4 py-2 bg-omni-primary hover:bg-omni-primary/90 text-white font-medium rounded-lg transition-colors shadow-lg shadow-omni-primary/20"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">New Project</span>
              </button>

              {/* App Switcher */}
              <AppSwitcher variant="header" showShortcutHint={false} />

              {/* Settings Button - Hidden on mobile (available in MobileNav) */}
              <button
                onClick={() => navigate('/settings')}
                className="hidden sm:block p-2 text-omni-text-secondary hover:text-omni-text hover:bg-omni-bg-secondary rounded-lg transition-colors"
                aria-label="Settings"
              >
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Mobile Search */}
          <div className="mt-4 sm:hidden overflow-x-hidden">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-omni-text-tertiary" />
              <input
                type="text"
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={cn(
                  'w-full pl-9 pr-4 py-2 bg-omni-bg border border-omni-border rounded-lg text-sm',
                  'text-omni-text placeholder:text-omni-text-tertiary',
                  'focus:outline-none focus:border-omni-primary focus:ring-1 focus:ring-omni-primary/20',
                  'transition-all'
                )}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8 pb-24 lg:pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
          {/* Projects grid - takes 2 columns on large screens */}
          <div className="lg:col-span-2">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-omni-text mb-1">Projects</h2>
              <p className="text-sm text-omni-text-secondary">
                {hasProjects ? 'Your workspaces' : 'Create your first workspace'}
              </p>
            </div>

            {hasProjects ? (
              <ProjectGrid onProjectClick={handleProjectClick} />
            ) : (
              // Empty state - clean and minimal
              <div className="text-center py-16 px-4 bg-omni-bg-secondary/30 rounded-lg border border-omni-border border-dashed">
                <FolderOpen className="w-16 h-16 mx-auto text-omni-text-tertiary mb-4" />
                <h3 className="text-lg font-semibold text-omni-text mb-2">
                  No projects yet
                </h3>
                <p className="text-omni-text-secondary mb-6 max-w-sm mx-auto">
                  Create your first project to start organizing tasks and tracking progress.
                </p>
                <button
                  onClick={handleCreateProject}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-omni-primary hover:bg-omni-primary/90 text-white font-medium rounded-lg transition-colors shadow-lg shadow-omni-primary/20"
                >
                  <Plus className="w-5 h-5" />
                  Create Your First Project
                </button>
              </div>
            )}
          </div>

          {/* Today's focus - takes 1 column on large screens */}
          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-6">
              <TodayFocus />
            </div>
          </div>
        </div>
      </div>

      {/* Create Project Modal */}
      <CreateProjectModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onProjectCreated={handleProjectCreated}
      />

      {/* Mobile Navigation */}
      <MobileNav />
    </div>
  )
}
