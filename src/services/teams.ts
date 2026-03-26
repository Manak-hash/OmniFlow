import { create } from 'zustand'
import type { Team, TeamMember, TeamInvitation, TeamRole } from '@/types/team'

interface TeamState {
  teams: Map<string, Team>
  members: Map<string, TeamMember[]> // teamId -> members
  invitations: Map<string, TeamInvitation>
  currentTeamId: string | null

  // Actions
  setCurrentTeam: (teamId: string | null) => void
  setTeams: (teams: Team[]) => void
  addTeam: (team: Team) => void
  updateTeam: (id: string, updates: Partial<Team>) => void
  removeTeam: (id: string) => void

  setTeamMembers: (teamId: string, members: TeamMember[]) => void
  addTeamMember: (teamId: string, member: TeamMember) => void
  updateMemberRole: (teamId: string, userId: string, role: TeamRole) => void
  removeTeamMember: (teamId: string, userId: string) => void
  getTeamMembers: (teamId: string) => TeamMember[]

  setInvitations: (invitations: TeamInvitation[]) => void
  addInvitation: (invitation: TeamInvitation) => void
  acceptInvitation: (id: string) => void
  revokeInvitation: (id: string) => void

  clearAll: () => void
}

export const useTeamStore = create<TeamState>((set, get) => ({
  teams: new Map(),
  members: new Map(),
  invitations: new Map(),
  currentTeamId: null,

  setCurrentTeam: (teamId) => set({ currentTeamId: teamId }),

  setTeams: (teams) => {
    const teamMap = new Map()
    teams.forEach(team => teamMap.set(team.id, team))
    set({ teams: teamMap })
  },

  addTeam: (team) => {
    set((state) => {
      const newTeams = new Map(state.teams)
      newTeams.set(team.id, team)
      return { teams: newTeams }
    })
  },

  updateTeam: (id, updates) => {
    set((state) => {
      const existing = state.teams.get(id)
      if (!existing) return state

      const newTeams = new Map(state.teams)
      newTeams.set(id, { ...existing, ...updates, updatedAt: new Date().toISOString() })
      return { teams: newTeams }
    })
  },

  removeTeam: (id) => {
    set((state) => {
      const newTeams = new Map(state.teams)
      newTeams.delete(id)
      return { teams: newTeams }
    })
  },

  setTeamMembers: (teamId, members) => {
    set((state) => {
      const newMembers = new Map(state.members)
      newMembers.set(teamId, members)
      return { members: newMembers }
    })
  },

  addTeamMember: (teamId, member) => {
    set((state) => {
      const existing = state.members.get(teamId) || []
      const newMembers = new Map(state.members)
      newMembers.set(teamId, [...existing, member])
      return { members: newMembers }
    })
  },

  updateMemberRole: (teamId, userId, role) => {
    set((state) => {
      const existing = state.members.get(teamId)
      if (!existing) return state

      const newMembers = new Map(state.members)
      newMembers.set(
        teamId,
        existing.map(m => m.userId === userId ? { ...m, role } : m)
      )
      return { members: newMembers }
    })
  },

  removeTeamMember: (teamId, userId) => {
    set((state) => {
      const existing = state.members.get(teamId)
      if (!existing) return state

      const newMembers = new Map(state.members)
      newMembers.set(teamId, existing.filter(m => m.userId !== userId))
      return { members: newMembers }
    })
  },

  getTeamMembers: (teamId) => {
    return get().members.get(teamId) || []
  },

  setInvitations: (invitations) => {
    const invitationMap = new Map()
    invitations.forEach(inv => invitationMap.set(inv.id, inv))
    set({ invitations: invitationMap })
  },

  addInvitation: (invitation) => {
    set((state) => {
      const newInvitations = new Map(state.invitations)
      newInvitations.set(invitation.id, invitation)
      return { invitations: newInvitations }
    })
  },

  acceptInvitation: (id) => {
    set((state) => {
      const existing = state.invitations.get(id)
      if (!existing) return state

      const newInvitations = new Map(state.invitations)
      newInvitations.set(id, { ...existing, accepted: true })
      return { invitations: newInvitations }
    })
  },

  revokeInvitation: (id) => {
    set((state) => {
      const newInvitations = new Map(state.invitations)
      newInvitations.delete(id)
      return { invitations: newInvitations }
    })
  },

  clearAll: () => set({
    teams: new Map(),
    members: new Map(),
    invitations: new Map(),
    currentTeamId: null
  })
}))
