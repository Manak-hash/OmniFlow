import { create } from 'zustand'
import type { Activity, ActivityAction } from '@/types/activity'

interface ActivityState {
  activities: Activity[]

  // Actions
  addActivity: (activity: Omit<Activity, 'id' | 'timestamp'>) => void
  getActivities: (limit?: number) => Activity[]
  getActivitiesByUser: (userId: string, limit?: number) => Activity[]
  getActivitiesByType: (action: ActivityAction, limit?: number) => Activity[]
  clearActivities: () => void
}

export const useActivityStore = create<ActivityState>((set, get) => ({
  activities: [],

  addActivity: (activity) => {
    const newActivity: Activity = {
      ...activity,
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString()
    }

    set((state) => {
      // Keep only last 100 activities
      const updated = [newActivity, ...state.activities].slice(0, 100)
      return { activities: updated }
    })
  },

  getActivities: (limit = 50) => {
    const state = get()
    return state.activities.slice(0, limit)
  },

  getActivitiesByUser: (userId: string, limit = 50) => {
    const state = get()
    return state.activities
      .filter(a => a.userId === userId)
      .slice(0, limit)
  },

  getActivitiesByType: (action: ActivityAction, limit = 50) => {
    const state = get()
    return state.activities
      .filter(a => a.action === action)
      .slice(0, limit)
  },

  clearActivities: () => set({ activities: [] })
}))
