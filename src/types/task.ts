/**
 * Task state representation
 */
export type TaskState = 'not-started' | 'in-progress' | 'blocked' | 'done' | 'failed';

/**
 * State transition record for tracking task state changes
 */
export interface StateTransition {
  from: TaskState;
  to: TaskState;
  timestamp: string;
  reason?: string;
}

/**
 * Core task interface with all essential fields
 */
export interface Task {
  // Core identity
  id: string;
  projectId: string;
  parentId: string | null;

  // Essential fields
  title: string;
  description: string;
  state: TaskState;
  dueDate?: string;

  // Ordering field for sibling tasks
  order: number;

  // Calculated fields
  progress: number;
  hasChildren: boolean;
  depth: number;

  // Additional fields for task details
  tags: string[];
  references: string[];
  progressTarget?: number;
  progressCurrent?: number;

  // Metadata
  createdAt: string;
  updatedAt: string;
  stateHistory: StateTransition[];
}
