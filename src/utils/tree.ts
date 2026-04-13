import type { Task } from '@/types/task'

/**
 * Flat task representation for list view rendering
 */
export interface FlatTask {
  task: Task
  depth: number
  hasChildren: boolean
  isExpanded: boolean
}

/**
 * Tree node representation for hierarchical visualization
 */
export interface TreeNode {
  task: Task
  children: TreeNode[]
}

/**
 * Converts task hierarchy to flat array for list view rendering
 * @param tasks - All tasks in the system
 * @param expandedIds - Set of task IDs that are expanded
 * @returns Array of FlatTask objects with depth and expansion state
 */
export function flattenTree(
  tasks: Task[],
  expandedIds: Set<string>
): FlatTask[] {
  if (tasks.length === 0) {
    return []
  }

  const result: FlatTask[] = []
  const taskMap = new Map<string, Task>()
  const childrenMap = new Map<string | null, Task[]>()

  // Build task lookup and children mapping
  for (const task of tasks) {
    taskMap.set(task.id, task)

    const parentId = task.parentId
    if (!childrenMap.has(parentId)) {
      childrenMap.set(parentId, [])
    }
    childrenMap.get(parentId)!.push(task)
  }

  // Recursive function to flatten tree
  function flatten(
    task: Task,
    depth: number,
    isExpanded: boolean
  ): void {
    const children = childrenMap.get(task.id) || []
    const hasChildren = children.length > 0
    const shouldExpand = isExpanded && expandedIds.has(task.id)

    result.push({
      task,
      depth,
      hasChildren,
      isExpanded: shouldExpand
    })

    // Only recurse if expanded and has children
    if (shouldExpand && hasChildren) {
      for (const child of children) {
        flatten(child, depth + 1, true)
      }
    }
  }

  // Start with root tasks (parentId === null)
  const rootTasks = childrenMap.get(null) || []
  for (const rootTask of rootTasks) {
    flatten(rootTask, 0, true)
  }

  return result
}

/**
 * Builds tree structure from flat task array
 * @param tasks - All tasks in the system
 * @returns Array of root TreeNode objects
 */
export function buildTree(tasks: Task[]): TreeNode[] {
  if (tasks.length === 0) {
    return []
  }

  const taskMap = new Map<string, TreeNode>()
  const childrenMap = new Map<string | null, string[]>()

  // Initialize tree nodes and build parent-child mapping
  for (const task of tasks) {
    const node: TreeNode = {
      task,
      children: []
    }
    taskMap.set(task.id, node)

    const parentId = task.parentId
    if (!childrenMap.has(parentId)) {
      childrenMap.set(parentId, [])
    }
    childrenMap.get(parentId)!.push(task.id)
  }

  // Link children to parents
  for (const task of tasks) {
    const node = taskMap.get(task.id)!
    const childIds = childrenMap.get(task.id) || []

    for (const childId of childIds) {
      const childNode = taskMap.get(childId)
      if (childNode) {
        node.children.push(childNode)
      }
    }
  }

  // Return root nodes (tasks with parentId === null)
  const rootIds = childrenMap.get(null) || []
  const roots: TreeNode[] = []

  for (const rootId of rootIds) {
    const rootNode = taskMap.get(rootId)
    if (rootNode) {
      roots.push(rootNode)
    }
  }

  return roots
}

/**
 * Detects circular references in task hierarchy
 * @param taskId - ID of task to check
 * @param tasks - All tasks in the system
 * @param newParentId - ID of potential new parent (null if making root)
 * @returns true if adding taskId as a child would create a cycle
 */
export function detectCycle(
  taskId: string,
  tasks: Task[],
  newParentId: string | null = null
): boolean {
  // If newParentId is null, we're making task a root - no cycle possible
  if (newParentId === null) {
    return false
  }

  // If task doesn't exist in tasks, no cycle possible
  const task = tasks.find(t => t.id === taskId)
  if (!task) {
    return false
  }

  // Use depth-first search to check if taskId is in the ancestry chain of newParentId
  const visited = new Set<string>()

  function dfs(currentId: string): boolean {
    // If we've reached the taskId, there's a cycle
    if (currentId === taskId) {
      return true
    }

    // Prevent infinite loops from corrupted data
    if (visited.has(currentId)) {
      return false
    }
    visited.add(currentId)

    // Find the current task
    const currentTask = tasks.find(t => t.id === currentId)
    if (!currentTask || !currentTask.parentId) {
      return false
    }

    // Recurse up the parent chain
    return dfs(currentTask.parentId)
  }

  return dfs(newParentId)
}
