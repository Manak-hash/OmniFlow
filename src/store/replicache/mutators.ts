import type { Mutators } from '@/types/store'
import type { Node } from '@/types/node'
import type { MindMap } from '@/types/mindmap'

export const mutators = {
  async createNode(tx: any, node: Node) {
    await tx.put(`nodes/${node.id}`, node)
  },

  async updateNode(tx: any, args: { id: string; changes: Partial<Node> }) {
    const { id, changes } = args
    const existing = await tx.get(`nodes/${id}`)
    if (!existing) throw new Error(`Node ${id} not found`)

    const updated: Node = {
      ...existing,
      ...changes,
      updatedAt: new Date().toISOString()
    }

    await tx.put(`nodes/${id}`, updated)
  },

  async deleteNode(tx: any, id: string) {
    const existing = await tx.get(`nodes/${id}`)
    if (!existing) throw new Error(`Node ${id} not found`)

    // Also delete all children
    const allNodes = await tx.getAll({ prefix: 'nodes/' })
    const children = allNodes.filter((n: Node) => n.parentId === id)
    for (const child of children) {
      await tx.delete(`nodes/${child.id}`)
    }

    await tx.delete(`nodes/${id}`)
  },

  async createMindMap(tx: any, mindmap: MindMap) {
    await tx.put(`mindmaps/${mindmap.id}`, mindmap)
  },

  async updateMindMap(tx: any, args: { id: string; changes: Partial<MindMap> }) {
    const { id, changes } = args
    const existing = await tx.get(`mindmaps/${id}`)
    if (!existing) throw new Error(`MindMap ${id} not found`)

    const updated: MindMap = {
      ...existing,
      ...changes,
      updatedAt: new Date().toISOString()
    }

    await tx.put(`mindmaps/${id}`, updated)
  }
} satisfies Mutators
