import type { Node } from './node'
import type { MindMap } from './mindmap'

// Replicache mutators
export interface Mutators {
  createNode: (tx: any, node: Node) => Promise<void>
  updateNode: (tx: any, args: { id: string; changes: Partial<Node> }) => Promise<void>
  deleteNode: (tx: any, id: string) => Promise<void>
  createMindMap: (tx: any, mindmap: MindMap) => Promise<void>
  updateMindMap: (tx: any, args: { id: string; changes: Partial<MindMap> }) => Promise<void>
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
