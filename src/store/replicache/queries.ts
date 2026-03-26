import type { Node } from '@/types/node'
import type { MindMap } from '@/types/mindmap'

export async function getNode(replicache: any, id: string): Promise<Node | undefined> {
  return await replicache.query(async (tx: any) => {
    return await tx.get(`nodes/${id}`)
  })
}

export async function getAllNodes(replicache: any): Promise<Node[]> {
  return await replicache.query(async (tx: any) => {
    const result = await tx.getAll({ prefix: 'nodes/' })
    return result || []
  })
}

export async function getMindMap(replicache: any, id: string): Promise<MindMap | undefined> {
  return await replicache.query(async (tx: any) => {
    return await tx.get(`mindmaps/${id}`)
  })
}

export async function getAllMindMaps(replicache: any): Promise<MindMap[]> {
  return await replicache.query(async (tx: any) => {
    const result = await tx.getAll({ prefix: 'mindmaps/' })
    return result || []
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
