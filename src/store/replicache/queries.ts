import type { Node } from '@/types/node'
import type { MindMap } from '@/types/mindmap'
import type { Task } from '@/types/task'
import type { Project } from '@/types/project'

export async function getNode(replicache: any, id: string): Promise<Node | undefined> {
  return await replicache.query(async (tx: any) => {
    return await tx.get(`nodes/${id}`)
  })
}

export async function getAllNodes(replicache: any): Promise<Node[]> {
  return await replicache.query(async (tx: any) => {
    const result: Node[] = []
    const entries = tx.scan({ prefix: 'nodes/' })
    for await (const entry of entries) {
      // Filter out undefined entries
      if (entry && entry.value) {
        result.push(entry.value)
      }
    }
    return result
  })
}

export async function getMindMap(replicache: any, id: string): Promise<MindMap | undefined> {
  return await replicache.query(async (tx: any) => {
    return await tx.get(`mindmaps/${id}`)
  })
}

export async function getAllMindMaps(replicache: any): Promise<MindMap[]> {
  return await replicache.query(async (tx: any) => {
    const result: MindMap[] = []
    const entries = tx.scan({ prefix: 'mindmaps/' })
    for await (const entry of entries) {
      // Filter out undefined entries
      if (entry && entry.value) {
        result.push(entry.value)
      }
    }
    return result
  })
}

export async function getRootNodes(replicache: any): Promise<Node[]> {
  const allNodes = await getAllNodes(replicache)
  return allNodes.filter(n => n.parentId === null)
}

export async function getChildNodes(replicache: any, parentId: string): Promise<Node[]> {
  const allNodes = await getAllNodes(replicache)
  return allNodes.filter(n => n.parentId === parentId)
}

export async function searchNodes(replicache: any, term: string): Promise<Node[]> {
  const allNodes = await getAllNodes(replicache)
  if (!term.trim()) return allNodes

  const searchLower = term.toLowerCase()
  return allNodes.filter(n =>
    n.title.toLowerCase().includes(searchLower) ||
    n.content.toLowerCase().includes(searchLower) ||
    n.tags.some(tag => tag.toLowerCase().includes(searchLower))
  )
}

// Task queries
export async function getTask(replicache: any, id: string): Promise<Task | undefined> {
  return await replicache.query(async (tx: any) => {
    return await tx.get(`tasks/${id}`)
  })
}

export async function getAllTasks(replicache: any): Promise<Task[]> {
  return await replicache.query(async (tx: any) => {
    const result: Task[] = []
    const entries = tx.scan({ prefix: 'tasks/' })
    for await (const entry of entries) {
      if (entry && entry.value) {
        result.push(entry.value)
      }
    }
    return result
  })
}

export async function getTasksByProject(replicache: any, projectId: string): Promise<Task[]> {
  const allTasks = await getAllTasks(replicache)
  return allTasks.filter(t => t.projectId === projectId)
}

export async function getTasksByParent(replicache: any, parentId: string): Promise<Task[]> {
  const allTasks = await getAllTasks(replicache)
  return allTasks.filter(t => t.parentId === parentId)
}

export async function getRootTasks(replicache: any, projectId: string): Promise<Task[]> {
  const allTasks = await getAllTasks(replicache)
  return allTasks.filter(t => t.projectId === projectId && t.parentId === null)
}

export async function searchTasks(replicache: any, term: string): Promise<Task[]> {
  const allTasks = await getAllTasks(replicache)
  if (!term.trim()) return allTasks

  const searchLower = term.toLowerCase()
  return allTasks.filter(t =>
    t.title.toLowerCase().includes(searchLower) ||
    t.description.toLowerCase().includes(searchLower)
  )
}

// Project queries
export async function getProject(replicache: any, id: string): Promise<Project | undefined> {
  return await replicache.query(async (tx: any) => {
    return await tx.get(`projects/${id}`)
  })
}

export async function getAllProjects(replicache: any): Promise<Project[]> {
  return await replicache.query(async (tx: any) => {
    const result: Project[] = []
    const entries = tx.scan({ prefix: 'projects/' })
    for await (const entry of entries) {
      if (entry && entry.value) {
        result.push(entry.value)
      }
    }
    return result
  })
}
