import type { Node } from './node'
import type { MindMap } from './mindmap'
import type { Comment } from './comment'
import type { ShareLink } from './share'
import type { Team, TeamMember, TeamInvitation, TeamRole } from './team'

// Replicache mutators
export interface Mutators {
  createNode: (tx: any, node: Node) => Promise<void>
  updateNode: (tx: any, args: { id: string; changes: Partial<Node> }) => Promise<void>
  deleteNode: (tx: any, id: string) => Promise<void>
  createMindMap: (tx: any, mindmap: MindMap) => Promise<void>
  updateMindMap: (tx: any, args: { id: string; changes: Partial<MindMap> }) => Promise<void>
  createComment: (tx: any, comment: Comment) => Promise<void>
  updateComment: (tx: any, args: { id: string; updates: Partial<Comment> }) => Promise<void>
  deleteComment: (tx: any, id: string) => Promise<void>
  createShareLink: (tx: any, link: ShareLink) => Promise<void>
  updateShareLink: (tx: any, args: { id: string; updates: Partial<ShareLink> }) => Promise<void>
  deleteShareLink: (tx: any, id: string) => Promise<void>
  incrementShareLinkAccess: (tx: any, id: string) => Promise<void>
  createTeam: (tx: any, team: Team) => Promise<void>
  updateTeam: (tx: any, args: { id: string; updates: Partial<Team> }) => Promise<void>
  deleteTeam: (tx: any, id: string) => Promise<void>
  addTeamMember: (tx: any, args: { teamId: string; member: TeamMember }) => Promise<void>
  updateTeamMemberRole: (tx: any, args: { teamId: string; userId: string; role: TeamRole }) => Promise<void>
  removeTeamMember: (tx: any, args: { teamId: string; userId: string }) => Promise<void>
  createTeamInvitation: (tx: any, invitation: TeamInvitation) => Promise<void>
  acceptTeamInvitation: (tx: any, id: string) => Promise<void>
  revokeTeamInvitation: (tx: any, id: string) => Promise<void>
}

// Replicache queries (for type safety)
export interface Queries {
  getNode: (id: string) => Promise<Node | undefined>
  getAllNodes: () => Promise<Node[]>
  getMindMap: (id: string) => Promise<MindMap | undefined>
  getAllMindMaps: () => Promise<MindMap[]>
  getRootNodes: () => Promise<Node[]>
  getChildNodes: (parentId: string) => Promise<Node[]>
}
