import { create } from 'zustand'
import type { UserPresence } from '@/types/presence'

interface PresenceState {
  users: Map<string, UserPresence>
  currentUser: UserPresence | null
  setCurrentUser: (user: UserPresence) => void
  updateUserPresence: (userId: string, presence: UserPresence) => void
  removeUser: (userId: string) => void
  clearUsers: () => void
  getUsersOnNode: (nodeId: string) => UserPresence[]
}

export const usePresenceStore = create<PresenceState>((set, get) => ({
  users: new Map(),
  currentUser: null,

  setCurrentUser: (user: UserPresence) => set({ currentUser: user }),

  updateUserPresence: (userId: string, presence: UserPresence) =>
    set((state) => {
      const newUsers = new Map(state.users)
      newUsers.set(userId, presence)
      return { users: newUsers }
    }),

  removeUser: (userId: string) =>
    set((state) => {
      const newUsers = new Map(state.users)
      newUsers.delete(userId)
      return { users: newUsers }
    }),

  clearUsers: () => set({ users: new Map() }),

  // Get users on a specific node
  getUsersOnNode: (nodeId: string) => {
    const state = get()
    const usersOnNode: UserPresence[] = []

    state.users.forEach((user) => {
      if (user.cursor.nodeId === nodeId) {
        usersOnNode.push(user)
      }
    })

    return usersOnNode
  }
}))
