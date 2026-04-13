import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { TaskState } from '@/types/node'
import { FilterState, GroupByField } from '@/utils/kanban'

export interface ColumnConfig {
  id: string
  title: string
  state: TaskState | null
  wipLimit: number | null
  color: string
  visible: boolean
  order: number
}

export interface KanbanUIState {
  // Column configuration
  columns: ColumnConfig[]
  setColumns: (columns: ColumnConfig[]) => void
  toggleColumnVisibility: (id: string) => void
  setColumnWipLimit: (id: string, limit: number | null) => void

  // View preferences
  compactMode: boolean
  setCompactMode: (compact: boolean) => void
  colorBy: 'priority' | 'tag' | null
  setColorBy: (colorBy: 'priority' | 'tag' | null) => void

  // Swimlanes
  swimlaneBy: GroupByField | null
  setSwimlaneBy: (swimlaneBy: GroupByField | null) => void

  // Filters
  filters: FilterState
  setSearchQuery: (query: string) => void
  toggleTagFilter: (tag: string) => void
  togglePriorityFilter: (priority: string) => void
  toggleAssigneeFilter: (assignee: string) => void
  toggleOverdueFilter: () => void
  clearAllFilters: () => void

  // Column order
  columnOrder: string[]
  setColumnOrder: (order: string[]) => void

  // Bulk selection
  selectedCardIds: Set<string>
  setSelectedCardIds: (ids: Set<string>) => void
  toggleCardSelection: (id: string) => void
  clearCardSelection: () => void
  selectAllVisible: (visibleIds: string[]) => void

  // Collapsed columns
  collapsedColumns: Set<string>
  toggleColumnCollapsed: (id: string) => void
}

export const useKanbanStore = create<KanbanUIState>()(
  persist(
    (set) => ({
      // Default column configuration
      columns: [
        {
          id: 'not-started',
          title: 'To Do',
          state: 'not-started',
          wipLimit: null,
          color: 'gray',
          visible: true,
          order: 0
        },
        {
          id: 'in-progress',
          title: 'In Progress',
          state: 'in-progress',
          wipLimit: null,
          color: 'blue',
          visible: true,
          order: 1
        },
        {
          id: 'stopped',
          title: 'Blocked',
          state: 'stopped',
          wipLimit: null,
          color: 'yellow',
          visible: true,
          order: 2
        },
        {
          id: 'finished-success',
          title: 'Done',
          state: 'finished-success',
          wipLimit: null,
          color: 'green',
          visible: true,
          order: 3
        },
        {
          id: 'finished-failure',
          title: 'Failed',
          state: 'finished-failure',
          wipLimit: null,
          color: 'red',
          visible: true,
          order: 4
        }
      ],

      // View preferences
      compactMode: false,
      colorBy: null,
      swimlaneBy: null,

      // Filters
      filters: {
        searchQuery: '',
        selectedTags: [],
        selectedPriorities: [],
        selectedAssignees: [],
        overdueOnly: false
      },

      // Column order (defaults to columns array order)
      columnOrder: ['not-started', 'in-progress', 'stopped', 'finished-success', 'finished-failure'],

      // Bulk selection
      selectedCardIds: new Set(),

      // Collapsed columns
      collapsedColumns: new Set(),

      // Actions
      setColumns: (columns) => set({ columns }),

      toggleColumnVisibility: (id) =>
        set((state) => ({
          columns: state.columns.map((col) =>
            col.id === id ? { ...col, visible: !col.visible } : col
          )
        })),

      setColumnWipLimit: (id, limit) =>
        set((state) => ({
          columns: state.columns.map((col) =>
            col.id === id ? { ...col, wipLimit: limit } : col
          )
        })),

      setCompactMode: (compact) => set({ compactMode: compact }),

      setColorBy: (colorBy) => set({ colorBy }),

      setSwimlaneBy: (swimlaneBy) => set({ swimlaneBy }),

      setSearchQuery: (query) =>
        set((state) => ({
          filters: { ...state.filters, searchQuery: query }
        })),

      toggleTagFilter: (tag) =>
        set((state) => ({
          filters: {
            ...state.filters,
            selectedTags: state.filters.selectedTags.includes(tag)
              ? state.filters.selectedTags.filter((t) => t !== tag)
              : [...state.filters.selectedTags, tag]
          }
        })),

      togglePriorityFilter: (priority) =>
        set((state) => ({
          filters: {
            ...state.filters,
            selectedPriorities: state.filters.selectedPriorities.includes(priority)
              ? state.filters.selectedPriorities.filter((p) => p !== priority)
              : [...state.filters.selectedPriorities, priority]
          }
        })),

      toggleAssigneeFilter: (assignee) =>
        set((state) => ({
          filters: {
            ...state.filters,
            selectedAssignees: state.filters.selectedAssignees.includes(assignee)
              ? state.filters.selectedAssignees.filter((a) => a !== assignee)
              : [...state.filters.selectedAssignees, assignee]
          }
        })),

      toggleOverdueFilter: () =>
        set((state) => ({
          filters: {
            ...state.filters,
            overdueOnly: !state.filters.overdueOnly
          }
        })),

      clearAllFilters: () =>
        set({
          filters: {
            searchQuery: '',
            selectedTags: [],
            selectedPriorities: [],
            selectedAssignees: [],
            overdueOnly: false
          }
        }),

      setColumnOrder: (order) => set({ columnOrder: order }),

      setSelectedCardIds: (ids) => set({ selectedCardIds: ids }),

      toggleCardSelection: (id) =>
        set((state) => {
          const newSet = new Set(state.selectedCardIds)
          if (newSet.has(id)) {
            newSet.delete(id)
          } else {
            newSet.add(id)
          }
          return { selectedCardIds: newSet }
        }),

      clearCardSelection: () => set({ selectedCardIds: new Set() }),

      selectAllVisible: (visibleIds) =>
        set({ selectedCardIds: new Set(visibleIds) }),

      toggleColumnCollapsed: (id) =>
        set((state) => {
          const newSet = new Set(state.collapsedColumns)
          if (newSet.has(id)) {
            newSet.delete(id)
          } else {
            newSet.add(id)
          }
          return { collapsedColumns: newSet }
        })
    }),
    {
      name: 'omniflow-kanban',
      partialize: (state) => ({
        columns: state.columns,
        compactMode: state.compactMode,
        colorBy: state.colorBy,
        columnOrder: state.columnOrder,
        swimlaneBy: state.swimlaneBy,
        filters: state.filters
      })
    }
  )
)
