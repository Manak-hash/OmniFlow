export type TaskState =
  | 'not-started'
  | 'in-progress'
  | 'stopped'
  | 'finished-success'
  | 'finished-failure'

export type TaskPriority = 'critical' | 'high' | 'medium' | 'low' | null

export interface StateTransition {
  from: TaskState | null
  to: TaskState
  timestamp: string
  reason?: string
}

export interface TimeLog {
  userId: string
  userName: string
  startTime: string
  endTime: string | null
  duration: number | null // minutes
}

export interface Node {
  // Identity
  id: string
  parentId: string | null

  // Content
  title: string
  content: string
  contentType: 'markdown' | 'code' | 'mixed'

  // Task State (optional)
  state: TaskState | null
  stateHistory: StateTransition[]

  // Progress Tracking
  progressTarget: number | null
  progressCurrent: number

  // Priority & Due Date
  priority: TaskPriority
  dueDate: string | null  // ISO timestamp

  // Relationships
  tags: string[]
  references: string[]
  assignees: string[]  // User IDs

  // Time Tracking
  timeEstimated: number | null  // minutes
  timeSpent: number              // minutes
  timeLogs: TimeLog[]

  // Locking for collaborative editing
  lockedBy: string | null  // userId of user who has locked this node
  lockedAt: string | null  // ISO timestamp when lock was acquired

  // Metadata
  createdAt: string
  updatedAt: string
  position?: { x: number; y: number }
}

// Create new node with defaults
export function createNode(overrides: Partial<Node> = {}): Node {
  const now = new Date().toISOString()
  return {
    id: crypto.randomUUID(),
    parentId: null,
    title: '',
    content: '',
    contentType: 'markdown',
    state: null,
    stateHistory: [],
    progressTarget: null,
    progressCurrent: 0,
    priority: null,
    dueDate: null,
    tags: [],
    references: [],
    assignees: [],
    timeEstimated: null,
    timeSpent: 0,
    timeLogs: [],
    lockedBy: null,
    lockedAt: null,
    createdAt: now,
    updatedAt: now,
    ...overrides
  }
}
