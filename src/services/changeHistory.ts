import { create } from 'zustand'
import type { ChangeHistory, ChangeHistoryFilter } from '@/types/history'

interface ChangeHistoryState {
  changes: ChangeHistory[]

  // Actions
  addChange: (change: Omit<ChangeHistory, 'id' | 'timestamp'>) => void
  getChangesForNode: (nodeId: string) => ChangeHistory[]
  getChangesByUser: (userId: string) => ChangeHistory[]
  getFilteredChanges: (filter: ChangeHistoryFilter) => ChangeHistory[]
  clearChanges: () => void
  clearChangesForNode: (nodeId: string) => void
}

export const useChangeHistoryStore = create<ChangeHistoryState>((set, get) => ({
  changes: [],

  addChange: (change) => {
    const newChange: ChangeHistory = {
      ...change,
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString()
    }

    set((state) => ({
      changes: [newChange, ...state.changes]
    }))
  },

  getChangesForNode: (nodeId: string) => {
    const state = get()
    return state.changes.filter((change) => change.nodeId === nodeId)
  },

  getChangesByUser: (userId: string) => {
    const state = get()
    return state.changes.filter((change) => change.userId === userId)
  },

  getFilteredChanges: (filter: ChangeHistoryFilter) => {
    const state = get()
    return state.changes.filter((change) => {
      // Filter by nodeId
      if (filter.nodeId && change.nodeId !== filter.nodeId) {
        return false
      }

      // Filter by userId
      if (filter.userId && change.userId !== filter.userId) {
        return false
      }

      // Filter by changeType
      if (filter.changeType && change.changeType !== filter.changeType) {
        return false
      }

      // Filter by date range
      const changeDate = new Date(change.timestamp)
      if (filter.startDate && changeDate < filter.startDate) {
        return false
      }
      if (filter.endDate && changeDate > filter.endDate) {
        return false
      }

      return true
    })
  },

  clearChanges: () => set({ changes: [] }),

  clearChangesForNode: (nodeId: string) => {
    set((state) => ({
      changes: state.changes.filter((change) => change.nodeId !== nodeId)
    }))
  }
}))
