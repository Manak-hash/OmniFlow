import { create } from 'zustand'
import type { ViewMode, LayoutAlgorithm } from '@/types/mindmap'

interface UIState {
  // View state
  viewMode: ViewMode
  layoutAlgorithm: LayoutAlgorithm

  // Selection
  selectedNodeId: string | null
  editingNodeId: string | null

  // UI state
  sidebarOpen: boolean
  nodeEditorOpen: boolean

  // Actions
  setViewMode: (mode: ViewMode) => void
  setLayoutAlgorithm: (algorithm: LayoutAlgorithm) => void
  setSelectedNode: (id: string | null) => void
  setEditingNode: (id: string | null) => void
  setSidebarOpen: (open: boolean) => void
  setNodeEditorOpen: (open: boolean) => void
}

export const useUIStore = create<UIState>((set) => ({
  // Initial state
  viewMode: 'mindmap-focus',
  layoutAlgorithm: 'tree',
  selectedNodeId: null,
  editingNodeId: null,
  sidebarOpen: true,
  nodeEditorOpen: false,

  // Actions
  setViewMode: (mode) => set({ viewMode: mode }),
  setLayoutAlgorithm: (algorithm) => set({ layoutAlgorithm: algorithm }),
  setSelectedNode: (id) => set({ selectedNodeId: id }),
  setEditingNode: (id) => set({ editingNodeId: id }),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setNodeEditorOpen: (open) => set({ nodeEditorOpen: open })
}))
