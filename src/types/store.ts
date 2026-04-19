import type { Node } from './node'
import type { MindMap } from './mindmap'
import type { Comment } from './comment'
import type { ShareLink } from './share'
import type { Team, TeamMember, TeamInvitation, TeamRole } from './team'
import type { Task } from './task'
import type { Project } from './project'

// Replicache mutators
export interface Mutators {
  createNode: (tx: any, node: Node) => Promise<void>
  updateNode: (tx: any, args: { id: string; changes: Partial<Node> }) => Promise<void>
  deleteNode: (tx: any, id: string) => Promise<void>
  createMindMap: (tx: any, mindmap: MindMap) => Promise<void>
  updateMindMap: (tx: any, args: { id: string; changes: Partial<MindMap> }) => Promise<void>
  createComment: (tx: any, comment: Comment) => Promise<void>
  updateComment: (tx: any, args: { id: string; updates: Partial<Comment> }) => Promise<void>
  deleteComment: (tx: any, id: string) => Promise<void>
  createShareLink: (tx: any, link: ShareLink) => Promise<void>
  updateShareLink: (tx: any, args: { id: string; updates: Partial<ShareLink> }) => Promise<void>
  deleteShareLink: (tx: any, id: string) => Promise<void>
  incrementShareLinkAccess: (tx: any, id: string) => Promise<void>
  createTeam: (tx: any, team: Team) => Promise<void>
  updateTeam: (tx: any, args: { id: string; updates: Partial<Team> }) => Promise<void>
  deleteTeam: (tx: any, id: string) => Promise<void>
  addTeamMember: (tx: any, args: { teamId: string; member: TeamMember }) => Promise<void>
  updateTeamMemberRole: (tx: any, args: { teamId: string; userId: string; role: TeamRole }) => Promise<void>
  removeTeamMember: (tx: any, args: { teamId: string; userId: string }) => Promise<void>
  createTeamInvitation: (tx: any, invitation: TeamInvitation) => Promise<void>
  acceptTeamInvitation: (tx: any, id: string) => Promise<void>
  revokeTeamInvitation: (tx: any, id: string) => Promise<void>
  // Task mutators
  createTask: (tx: any, task: Task) => Promise<void>
  updateTask: (tx: any, args: { id: string; changes: Partial<Task> }) => Promise<void>
  deleteTask: (tx: any, id: string) => Promise<void>
  // Project mutators
  createProject: (tx: any, project: Project) => Promise<void>
  updateProject: (tx: any, args: { id: string; changes: Partial<Project> }) => Promise<void>
  deleteProject: (tx: any, id: string) => Promise<void>
}

// Replicache queries (for type safety)
export interface Queries {
  getNode: (id: string) => Promise<Node | undefined>
  getAllNodes: () => Promise<Node[]>
  getMindMap: (id: string) => Promise<MindMap | undefined>
  getAllMindMaps: () => Promise<MindMap[]>
  getRootNodes: () => Promise<Node[]>
  getChildNodes: (parentId: string) => Promise<Node[]>
}

/**
 * Task store interface for task management
 */
export interface TaskStore {
  // State
  tasks: Task[]
  selectedTaskId: string | null
  collapsedTasks: Map<string, Set<string>> // projectId -> Set of taskIds

  // Query methods
  getTask: (id: string) => Task | undefined
  getTasksByProject: (projectId: string) => Task[]
  getTasksByParent: (parentId: string) => Task[]
  getRootTasks: (projectId: string) => Task[]

  // Mutation methods
  createTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'progress' | 'hasChildren' | 'depth' | 'order'>) => Task
  updateTask: (id: string, changes: Partial<Omit<Task, 'id' | 'createdAt' | 'updatedAt'>>) => void
  deleteTask: (id: string) => void
  recalculateProgress: (id: string) => void

  // UI state methods
  setSelectedTask: (taskId: string | null) => void
  toggleTaskCollapse: (projectId: string, taskId: string) => void
  moveTask: (taskId: string, zone: 'subtask' | 'before' | 'after', targetTaskId: string) => void
  isDescendant: (taskId: string, ancestorId: string) => boolean
  hasOrderCollisions: (siblings: Task[]) => boolean
  rebalanceOrders: (parentId: string | null) => void
}

/**
 * Project store interface for project management
 */
export interface ProjectStore {
  // State
  projects: Map<string, Project>

  // Query methods
  getProject: (id: string) => Project | undefined
  getProjectBySlug: (slug: string) => Project | null
  getAllProjects: () => Project[]

  // Mutation methods
  createProject: (project: Omit<Project, 'id' | 'slug' | 'createdAt' | 'updatedAt'>) => Project
  updateProject: (id: string, changes: Partial<Omit<Project, 'id' | 'slug' | 'createdAt' | 'updatedAt'>>) => void
  deleteProject: (id: string) => void
}

/**
 * Filter state for task filtering
 */
export type FilterState = 'all' | 'not-started' | 'in-progress' | 'blocked' | 'done' | 'failed'

/**
 * UI store interface for UI state management
 */
export interface UIStore {
  // Selection state
  selectedTaskIds: Set<string>
  selectTask: (id: string) => void
  deselectTask: (id: string) => void
  clearSelection: () => void
  toggleTaskSelection: (id: string) => void

  // View mode
  viewMode: 'list' | 'kanban'
  setViewMode: (mode: 'list' | 'kanban') => void

  // Edit panel state
  isEditPanelOpen: boolean
  editingTaskId: string | null
  openEditPanel: (taskId: string) => void
  closeEditPanel: () => void

  // Collapsed tasks state
  collapsedTaskIds: Set<string>
  toggleTaskCollapsed: (id: string) => void
  setTaskCollapsed: (id: string, collapsed: boolean) => void

  // Search state
  searchQuery: string
  setSearchQuery: (query: string) => void

  // Filter state
  filterState: FilterState
  setFilterState: (state: FilterState) => void

  // Help modal state
  isHelpOpen: boolean
  openHelp: () => void
  closeHelp: () => void
}
