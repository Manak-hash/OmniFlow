import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { UIStore as IUIStore, FilterState } from '@/types/store'

/**
 * Zustand store for UI state management with persistence
 */
export const useUIStore = create<IUIStore>()(
  persist(
    (set, get) => ({
      // Initial state
      selectedTaskIds: new Set(),
      viewMode: 'list',
      isEditPanelOpen: false,
      editingTaskId: null,
      collapsedTaskIds: new Set(),
      searchQuery: '',
      filterState: 'all',
      isHelpOpen: false,

      // Selection methods
      selectTask: (id: string) => {
        const state = get()
        const newSelected = new Set(state.selectedTaskIds)
        newSelected.add(id)
        set({ selectedTaskIds: newSelected })
      },

      deselectTask: (id: string) => {
        const state = get()
        const newSelected = new Set(state.selectedTaskIds)
        newSelected.delete(id)
        set({ selectedTaskIds: newSelected })
      },

      clearSelection: () => {
        set({ selectedTaskIds: new Set() })
      },

      toggleTaskSelection: (id: string) => {
        const state = get()
        const newSelected = new Set(state.selectedTaskIds)
        if (newSelected.has(id)) {
          newSelected.delete(id)
        } else {
          newSelected.add(id)
        }
        set({ selectedTaskIds: newSelected })
      },

      // View mode methods
      setViewMode: (mode: 'list' | 'kanban') => {
        set({ viewMode: mode })
      },

      // Edit panel methods
      openEditPanel: (taskId: string) => {
        set({
          isEditPanelOpen: true,
          editingTaskId: taskId
        })
      },

      closeEditPanel: () => {
        set({
          isEditPanelOpen: false,
          editingTaskId: null
        })
      },

      // Collapsed tasks methods
      toggleTaskCollapsed: (id: string) => {
        const state = get()
        const newCollapsed = new Set(state.collapsedTaskIds)
        if (newCollapsed.has(id)) {
          newCollapsed.delete(id)
        } else {
          newCollapsed.add(id)
        }
        set({ collapsedTaskIds: newCollapsed })
      },

      setTaskCollapsed: (id: string, collapsed: boolean) => {
        const state = get()
        const newCollapsed = new Set(state.collapsedTaskIds)
        if (collapsed) {
          newCollapsed.add(id)
        } else {
          newCollapsed.delete(id)
        }
        set({ collapsedTaskIds: newCollapsed })
      },

      // Search methods
      setSearchQuery: (query: string) => {
        set({ searchQuery: query })
      },

      // Filter methods
      setFilterState: (state: FilterState) => {
        set({ filterState: state })
      },

      // Help modal methods
      openHelp: () => {
        set({ isHelpOpen: true })
      },

      closeHelp: () => {
        set({ isHelpOpen: false })
      }
    }),
    {
      name: 'omniflow-ui',
      partialize: (state) => ({
        selectedTaskIds: Array.from(state.selectedTaskIds),
        viewMode: state.viewMode,
        isEditPanelOpen: state.isEditPanelOpen,
        editingTaskId: state.editingTaskId,
        collapsedTaskIds: Array.from(state.collapsedTaskIds),
        searchQuery: state.searchQuery,
        filterState: state.filterState,
        isHelpOpen: state.isHelpOpen
      }),
      merge: (persistedState: any, currentState) => ({
        ...currentState,
        viewMode: persistedState.viewMode || 'list',
        selectedTaskIds: new Set(persistedState.selectedTaskIds || []),
        collapsedTaskIds: new Set(persistedState.collapsedTaskIds || []),
        searchQuery: persistedState.searchQuery || '',
        filterState: persistedState.filterState || 'all'
      })
    }
  )
)
