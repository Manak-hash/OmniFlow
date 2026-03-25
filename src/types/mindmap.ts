export type LayoutAlgorithm = 'tree' | 'force-directed' | 'radial'
export type ViewMode = 'mindmap-focus' | 'mindmap-panoramic' | 'tree-table'

export interface MindMap {
  id: string
  name: string
  rootNodeId: string
  layoutAlgorithm: LayoutAlgorithm
  viewMode: ViewMode
  createdAt: string
  updatedAt: string
}

export function createMindMap(overrides: Partial<MindMap> = {}): MindMap {
  const now = new Date().toISOString()
  return {
    id: crypto.randomUUID(),
    name: 'Untitled MindMap',
    rootNodeId: crypto.randomUUID(),
    layoutAlgorithm: 'tree',
    viewMode: 'mindmap-focus',
    createdAt: now,
    updatedAt: now,
    ...overrides
  }
}
