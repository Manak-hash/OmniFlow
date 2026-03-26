import { create } from 'zustand'
import { persist } from 'zustand/middleware'
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

  // Tags
  allTags: string[]
  setAllTags: (tags: string[]) => void

  // Tree Table
  expandedRowIds: Set<string>
  toggleRowExpanded: (id: string) => void
  setAllRowsExpanded: (expanded: boolean) => void

  // Actions
  setViewMode: (mode: ViewMode) => void
  setLayoutAlgorithm: (algorithm: LayoutAlgorithm) => void
  setSelectedNode: (id: string | null) => void
  setEditingNode: (id: string | null) => void
  setSidebarOpen: (open: boolean) => void
  setNodeEditorOpen: (open: boolean) => void
}

export const useUIStore = create<UIState>()(
  persist(
    (set, get) => ({
      // Initial state
      viewMode: 'mindmap-focus',
      layoutAlgorithm: 'tree',
      selectedNodeId: null,
      editingNodeId: null,
      sidebarOpen: true,
      nodeEditorOpen: false,
      allTags: [],
      expandedRowIds: new Set<string>(),

      // Actions
      setViewMode: (mode) => set({ viewMode: mode }),
      setLayoutAlgorithm: (algorithm) => set({ layoutAlgorithm: algorithm }),
      setSelectedNode: (id) => set({ selectedNodeId: id }),
      setEditingNode: (id) => set({ editingNodeId: id }),
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      setNodeEditorOpen: (open) => set({ nodeEditorOpen: open }),
      setAllTags: (tags) => set({ allTags: tags }),

      // Tree Table actions
      toggleRowExpanded: (id) => {
        const { expandedRowIds } = get()
        const newSet = new Set(expandedRowIds)
        if (newSet.has(id)) {
          newSet.delete(id)
        } else {
          newSet.add(id)
        }
        set({ expandedRowIds: newSet })
      },

      setAllRowsExpanded: (expanded) => {
        // Note: This is a simplification - we'd need all node IDs, not just tags
        // For now, we'll just clear or keep existing
        if (expanded) {
          // Would need all node IDs here - leaving as placeholder
          set({ expandedRowIds: new Set(get().expandedRowIds) })
        } else {
          set({ expandedRowIds: new Set() })
        }
      }
    }),
    {
      name: 'omniflow-ui',
      partialize: (state) => ({
        viewMode: state.viewMode,
        layoutAlgorithm: state.layoutAlgorithm,
        sidebarOpen: state.sidebarOpen
      })
    }
  )
)
