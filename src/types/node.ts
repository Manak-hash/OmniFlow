export type TaskState =
  | 'not-started'
  | 'in-progress'
  | 'stopped'
  | 'finished-success'
  | 'finished-failure'

export interface StateTransition {
  from: TaskState | null
  to: TaskState
  timestamp: string
  reason?: string
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

  // Relationships
  tags: string[]
  references: string[]

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
    tags: [],
    references: [],
    createdAt: now,
    updatedAt: now,
    ...overrides
  }
}
