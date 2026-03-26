import type { Mutators } from '@/types/store'
import type { Node, StateTransition } from '@/types/node'
import type { MindMap } from '@/types/mindmap'
import type { ChangeType, FieldChange } from '@/types/history'
import type { Comment } from '@/types/comment'
import type { ShareLink } from '@/types/share'
import type { Team, TeamMember, TeamInvitation } from '@/types/team'
import { getSyncService } from '@/services/sync'
import { useChangeHistoryStore } from '@/services/changeHistory'
import { useCommentStore } from '@/services/comments'
import { useActivityStore } from '@/services/activity'
import { useShareLinkStore } from '@/services/shareLinks'
import { useTeamStore } from '@/services/teams'

const CURRENT_USER_ID = 'local-user'
const CURRENT_USER_NAME = 'You'

// Helper function to detect which fields changed
function detectChanges(existing: Node, changes: Partial<Node>): { changeType: ChangeType | 'bulk'; fieldChanges: FieldChange[] } {
  const fieldChanges: FieldChange[] = []
  const changedFields: string[] = []

  // Check each field
  if (changes.title !== undefined && changes.title !== existing.title) {
    fieldChanges.push({ field: 'title', oldValue: existing.title, newValue: changes.title })
    changedFields.push('title')
  }

  if (changes.content !== undefined && changes.content !== existing.content) {
    fieldChanges.push({ field: 'content', oldValue: existing.content, newValue: changes.content })
    changedFields.push('content')
  }

  if (changes.state !== undefined && changes.state !== existing.state) {
    fieldChanges.push({ field: 'state', oldValue: existing.state, newValue: changes.state })
    changedFields.push('state')
  }

  if (changes.progressCurrent !== undefined && changes.progressCurrent !== existing.progressCurrent) {
    fieldChanges.push({ field: 'progressCurrent', oldValue: existing.progressCurrent, newValue: changes.progressCurrent })
    changedFields.push('progress')
  }

  if (changes.progressTarget !== undefined && changes.progressTarget !== existing.progressTarget) {
    fieldChanges.push({ field: 'progressTarget', oldValue: existing.progressTarget, newValue: changes.progressTarget })
    changedFields.push('progress')
  }

  if (changes.tags !== undefined && JSON.stringify(changes.tags) !== JSON.stringify(existing.tags)) {
    fieldChanges.push({ field: 'tags', oldValue: existing.tags, newValue: changes.tags })
    changedFields.push('tags')
  }

  if (changes.references !== undefined && JSON.stringify(changes.references) !== JSON.stringify(existing.references)) {
    fieldChanges.push({ field: 'references', oldValue: existing.references, newValue: changes.references })
    changedFields.push('references')
  }

  if (changes.position !== undefined && JSON.stringify(changes.position) !== JSON.stringify(existing.position)) {
    fieldChanges.push({ field: 'position', oldValue: existing.position, newValue: changes.position })
    changedFields.push('position')
  }

  // Determine change type
  let changeType: ChangeType | 'bulk' = 'bulk'
  if (changedFields.length === 1) {
    changeType = changedFields[0] as ChangeType
  }

  return { changeType, fieldChanges }
}

export const mutators = {
  async createNode(tx: any, node: Node) {
    await tx.put(`nodes/${node.id}`, node)

    // Record change history
    useChangeHistoryStore.getState().addChange({
      nodeId: node.id,
      userId: CURRENT_USER_ID,
      userName: CURRENT_USER_NAME,
      changeType: 'created',
      changes: [{ field: 'node', oldValue: null, newValue: node }]
    })

    // Record activity
    useActivityStore.getState().addActivity({
      userId: CURRENT_USER_ID,
      userName: CURRENT_USER_NAME,
      action: 'created',
      targetType: 'node',
      targetId: node.id,
      targetTitle: node.title || 'Untitled'
    })

    // Track pending change for sync
    getSyncService().incrementPendingChanges()
  },

  async updateNode(tx: any, args: { id: string; changes: Partial<Node> & { stateTransitionReason?: string } }) {
    const { id, changes } = args
    const existing = await tx.get(`nodes/${id}`)
    if (!existing) throw new Error(`Node ${id} not found`)

    // Detect changes for history
    const { changeType, fieldChanges } = detectChanges(existing, changes)

    // Handle state transitions
    let stateHistory = existing.stateHistory || []
    if (changes.state && changes.state !== existing.state) {
      const transition: StateTransition = {
        from: existing.state,
        to: changes.state,
        timestamp: new Date().toISOString(),
        reason: changes.stateTransitionReason
      }
      stateHistory = [...stateHistory, transition]
    }

    const { stateTransitionReason, ...validChanges } = changes

    const updated: Node = {
      ...existing,
      ...validChanges,
      stateHistory,
      updatedAt: new Date().toISOString()
    }

    await tx.put(`nodes/${id}`, updated)

    // Record change history if there are actual changes
    if (fieldChanges.length > 0) {
      useChangeHistoryStore.getState().addChange({
        nodeId: id,
        userId: CURRENT_USER_ID,
        userName: CURRENT_USER_NAME,
        changeType,
        changes: fieldChanges,
        reason: changes.stateTransitionReason
      })
    }

    // Track pending change for sync
    getSyncService().incrementPendingChanges()
  },

  async deleteNode(tx: any, id: string) {
    const existing = await tx.get(`nodes/${id}`)
    if (!existing) throw new Error(`Node ${id} not found`)

    // Also delete all children
    const allNodes = await tx.getAll({ prefix: 'nodes/' })
    const children = allNodes.filter((n: Node) => n.parentId === id)
    for (const child of children) {
      await tx.delete(`nodes/${child.id}`)

      // Record deletion for children
      useChangeHistoryStore.getState().addChange({
        nodeId: child.id,
        userId: CURRENT_USER_ID,
        userName: CURRENT_USER_NAME,
        changeType: 'deleted',
        changes: [{ field: 'node', oldValue: child, newValue: null }]
      })
    }

    await tx.delete(`nodes/${id}`)

    // Record deletion for node
    useChangeHistoryStore.getState().addChange({
      nodeId: id,
      userId: CURRENT_USER_ID,
      userName: CURRENT_USER_NAME,
      changeType: 'deleted',
      changes: [{ field: 'node', oldValue: existing, newValue: null }]
    })

    // Track pending change for sync
    getSyncService().incrementPendingChanges()
  },

  async createMindMap(tx: any, mindmap: MindMap) {
    await tx.put(`mindmaps/${mindmap.id}`, mindmap)
    getSyncService().incrementPendingChanges()
  },

  async updateMindMap(tx: any, args: { id: string; changes: Partial<MindMap> }) {
    const { id, changes } = args
    const existing = await tx.get(`mindmaps/${id}`)
    if (!existing) throw new Error(`MindMap ${id} not found`)

    const updated: MindMap = {
      ...existing,
      ...changes,
      updatedAt: new Date().toISOString()
    }

    await tx.put(`mindmaps/${id}`, updated)
    getSyncService().incrementPendingChanges()
  },

  async createComment(tx: any, comment: Comment) {
    await tx.put(`comments/${comment.id}`, comment)

    // Update store
    useCommentStore.getState().addComment(comment)

    // Record activity
    useActivityStore.getState().addActivity({
      userId: CURRENT_USER_ID,
      userName: CURRENT_USER_NAME,
      action: 'commented',
      targetType: 'comment',
      targetId: comment.id
    })

    getSyncService().incrementPendingChanges()
  },

  async updateComment(tx: any, args: { id: string; updates: Partial<Comment> }) {
    const { id, updates } = args
    const existing = await tx.get(`comments/${id}`)
    if (!existing) throw new Error(`Comment ${id} not found`)

    const updated: Comment = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString(),
      edited: true
    }

    await tx.put(`comments/${id}`, updated)

    // Update store
    useCommentStore.getState().updateComment(id, updates)

    getSyncService().incrementPendingChanges()
  },

  async deleteComment(tx: any, id: string) {
    const existing = await tx.get(`comments/${id}`)
    if (!existing) throw new Error(`Comment ${id} not found`)

    await tx.delete(`comments/${id}`)

    // Update store
    useCommentStore.getState().deleteComment(id)

    getSyncService().incrementPendingChanges()
  },

  async createShareLink(tx: any, link: ShareLink) {
    await tx.put(`sharelinks/${link.id}`, link)

    // Update store
    useShareLinkStore.getState().addLink(link)

    getSyncService().incrementPendingChanges()
  },

  async updateShareLink(tx: any, args: { id: string; updates: Partial<ShareLink> }) {
    const { id, updates } = args
    const existing = await tx.get(`sharelinks/${id}`)
    if (!existing) throw new Error(`ShareLink ${id} not found`)

    const updated: ShareLink = {
      ...existing,
      ...updates
    }

    await tx.put(`sharelinks/${id}`, updated)

    // Update store
    useShareLinkStore.getState().updateLink(id, updates)

    getSyncService().incrementPendingChanges()
  },

  async deleteShareLink(tx: any, id: string) {
    const existing = await tx.get(`sharelinks/${id}`)
    if (!existing) throw new Error(`ShareLink ${id} not found`)

    await tx.delete(`sharelinks/${id}`)

    // Update store
    useShareLinkStore.getState().removeLink(id)

    getSyncService().incrementPendingChanges()
  },

  async incrementShareLinkAccess(tx: any, id: string) {
    const existing = await tx.get(`sharelinks/${id}`)
    if (!existing) throw new Error(`ShareLink ${id} not found`)

    const updated: ShareLink = {
      ...existing,
      accessCount: existing.accessCount + 1
    }

    await tx.put(`sharelinks/${id}`, updated)

    // Update store
    useShareLinkStore.getState().incrementAccessCount(id)

    getSyncService().incrementPendingChanges()
  },

  async createTeam(tx: any, team: Team) {
    await tx.put(`teams/${team.id}`, team)

    // Update store
    useTeamStore.getState().addTeam(team)

    getSyncService().incrementPendingChanges()
  },

  async updateTeam(tx: any, args: { id: string; updates: Partial<Team> }) {
    const { id, updates } = args
    const existing = await tx.get(`teams/${id}`)
    if (!existing) throw new Error(`Team ${id} not found`)

    const updated: Team = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString()
    }

    await tx.put(`teams/${id}`, updated)

    // Update store
    useTeamStore.getState().updateTeam(id, updates)

    getSyncService().incrementPendingChanges()
  },

  async deleteTeam(tx: any, id: string) {
    await tx.delete(`teams/${id}`)

    // Update store
    useTeamStore.getState().removeTeam(id)

    getSyncService().incrementPendingChanges()
  },

  async addTeamMember(tx: any, args: { teamId: string; member: TeamMember }) {
    const { teamId, member } = args

    // Update team memberIds
    const team = await tx.get(`teams/${teamId}`)
    if (!team) throw new Error(`Team ${teamId} not found`)

    const updatedTeam: Team = {
      ...team,
      memberIds: [...team.memberIds, member.userId],
      updatedAt: new Date().toISOString()
    }

    await tx.put(`teams/${teamId}`, updatedTeam)
    await tx.put(`teammembers/${teamId}_${member.userId}`, member)

    // Update store
    useTeamStore.getState().addTeamMember(teamId, member)
    useTeamStore.getState().updateTeam(teamId, { memberIds: updatedTeam.memberIds })

    getSyncService().incrementPendingChanges()
  },

  async updateTeamMemberRole(tx: any, args: { teamId: string; userId: string; role: any }) {
    const { teamId, userId, role } = args

    const memberKey = `teammembers/${teamId}_${userId}`
    const existing = await tx.get(memberKey)
    if (!existing) throw new Error(`Team member ${userId} not found`)

    const updated: TeamMember = {
      ...existing,
      role
    }

    await tx.put(memberKey, updated)

    // Update store
    useTeamStore.getState().updateMemberRole(teamId, userId, role)

    getSyncService().incrementPendingChanges()
  },

  async removeTeamMember(tx: any, args: { teamId: string; userId: string }) {
    const { teamId, userId } = args

    // Remove member record
    await tx.delete(`teammembers/${teamId}_${userId}`)

    // Update team memberIds
    const team = await tx.get(`teams/${teamId}`)
    if (!team) throw new Error(`Team ${teamId} not found`)

    const updatedTeam: Team = {
      ...team,
      memberIds: team.memberIds.filter((id: string) => id !== userId),
      updatedAt: new Date().toISOString()
    }

    await tx.put(`teams/${teamId}`, updatedTeam)

    // Update store
    useTeamStore.getState().removeTeamMember(teamId, userId)
    useTeamStore.getState().updateTeam(teamId, { memberIds: updatedTeam.memberIds })

    getSyncService().incrementPendingChanges()
  },

  async createTeamInvitation(tx: any, invitation: TeamInvitation) {
    await tx.put(`teaminvitations/${invitation.id}`, invitation)

    // Update store
    useTeamStore.getState().addInvitation(invitation)

    getSyncService().incrementPendingChanges()
  },

  async acceptTeamInvitation(tx: any, id: string) {
    const existing = await tx.get(`teaminvitations/${id}`)
    if (!existing) throw new Error(`Invitation ${id} not found`)

    const updated: TeamInvitation = {
      ...existing,
      accepted: true
    }

    await tx.put(`teaminvitations/${id}`, updated)

    // Update store
    useTeamStore.getState().acceptInvitation(id)

    getSyncService().incrementPendingChanges()
  },

  async revokeTeamInvitation(tx: any, id: string) {
    await tx.delete(`teaminvitations/${id}`)

    // Update store
    useTeamStore.getState().revokeInvitation(id)

    getSyncService().incrementPendingChanges()
  }
} satisfies Mutators
