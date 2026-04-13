// Simple in-memory store for testing (will replace Replicache)
import type { Node } from '@/types/node'
import type { MindMap } from '@/types/mindmap'

const STORE_KEY = 'omniflow-store'

interface OmniFlowStore {
  mindmaps: Record<string, MindMap>
  nodes: Record<string, Node>
}

let store: OmniFlowStore = {
  mindmaps: {},
  nodes: {}
}

// Load from localStorage on init
function loadStore() {
  try {
    const saved = localStorage.getItem(STORE_KEY)
    if (saved) {
      store = JSON.parse(saved)
    }
  } catch (error) {
    console.error('[SimpleStore] Failed to load:', error)
  }
}

// Save to localStorage
function saveStore() {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(store))
  } catch (error) {
    console.error('[SimpleStore] Failed to save:', error)
  }
}

// Initialize
loadStore()

// Mutators
export async function createMindMap(mindmap: MindMap) {
  store.mindmaps[mindmap.id] = mindmap
  saveStore()
  return mindmap
}

export async function createNode(node: Node) {
  store.nodes[node.id] = node
  saveStore()
  return node
}

export async function updateNode(args: { id: string; changes: Partial<Node> }) {
  const { id, changes } = args
  if (!store.nodes[id]) {
    throw new Error(`Node ${id} not found`)
  }
  store.nodes[id] = { ...store.nodes[id], ...changes, updatedAt: new Date().toISOString() }
  saveStore()
}

export async function deleteNode(id: string) {
  if (!store.nodes[id]) {
    throw new Error(`Node ${id} not found`)
  }
  delete store.nodes[id]
  saveStore()
}

// Queries
export async function getMindMap(id: string): Promise<MindMap | undefined> {
  return store.mindmaps[id]
}

export async function getAllMindMaps(): Promise<MindMap[]> {
  return Object.values(store.mindmaps)
}

export async function getNode(id: string): Promise<Node | undefined> {
  return store.nodes[id]
}

export async function getAllNodes(): Promise<Node[]> {
  return Object.values(store.nodes)
}

export function resetStore() {
  store = { mindmaps: {}, nodes: {} }
  localStorage.removeItem(STORE_KEY)
}
