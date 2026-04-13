import { useState } from 'react'
import { Users, UserPlus, Crown, Shield, UserMinus, Mail } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useTeamStore } from '@/services/teams'
import { getReplicache } from '@/store/replicache'
import type { Team, TeamMember, TeamRole } from '@/types/team'
import { cn } from '@/utils/cn'
import { toast } from 'sonner'

interface TeamDialogProps {
  isOpen: boolean
  onClose: () => void
}

const ROLE_CONFIG: Record<TeamRole, { label: string; color: string; icon: any }> = {
  owner: { label: 'Owner', color: 'text-yellow-400', icon: Crown },
  admin: { label: 'Admin', color: 'text-purple-400', icon: Shield },
  member: { label: 'Member', color: 'text-blue-400', icon: Users },
  guest: { label: 'Guest', color: 'text-gray-400', icon: Users }
}

export function TeamDialog({ isOpen, onClose }: TeamDialogProps) {
  const { teams, currentTeamId, setCurrentTeam, getTeamMembers } = useTeamStore()
  const [replicache, setReplicache] = useState<any>(null)

  useState(() => {
    getReplicache().then(setReplicache)
  })

  const [view, setView] = useState<'list' | 'create' | 'members'>('list')
  const [newTeamName, setNewTeamName] = useState('')
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<TeamRole>('member')

  const currentTeam = currentTeamId ? teams.get(currentTeamId) : null
  const teamMembers = currentTeamId ? getTeamMembers(currentTeamId) : []

  const handleCreateTeam = async () => {
    if (!newTeamName.trim()) {
      toast.error('Please enter a team name')
      return
    }

    if (!replicache) return

    try {
      const newTeam: Team = {
        id: crypto.randomUUID(),
        name: newTeamName.trim(),
        ownerId: 'local-user',
        memberIds: ['local-user'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      await replicache.mutate.createTeam(newTeam)

      // Add owner as first member
      const ownerMember: TeamMember = {
        userId: 'local-user',
        userName: 'You',
        role: 'owner',
        joinedAt: new Date().toISOString()
      }

      await replicache.mutate.addTeamMember({
        teamId: newTeam.id,
        member: ownerMember
      })

      setCurrentTeam(newTeam.id)
      setNewTeamName('')
      setView('members')
      toast.success('Team created')
    } catch (error) {
      console.error('Failed to create team:', error)
      toast.error('Failed to create team')
    }
  }

  const handleInviteMember = async () => {
    if (!inviteEmail.trim() || !currentTeamId) {
      toast.error('Please enter an email address')
      return
    }

    if (!replicache) return

    try {
      const invitation = {
        id: crypto.randomUUID(),
        teamId: currentTeamId,
        email: inviteEmail.trim(),
        role: inviteRole,
        invitedBy: 'local-user',
        invitedByUserName: 'You',
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
        accepted: false
      }

      await replicache.mutate.createTeamInvitation(invitation)
      setInviteEmail('')
      toast.success(`Invitation sent to ${inviteEmail}`)
    } catch (error) {
      console.error('Failed to invite member:', error)
      toast.error('Failed to send invitation')
    }
  }

  const handleUpdateRole = async (userId: string, newRole: TeamRole) => {
    if (!currentTeamId || !replicache) return

    try {
      await replicache.mutate.updateTeamMemberRole({
        teamId: currentTeamId,
        userId,
        role: newRole
      })
      toast.success('Role updated')
    } catch (error) {
      console.error('Failed to update role:', error)
      toast.error('Failed to update role')
    }
  }

  const handleRemoveMember = async (userId: string) => {
    if (!currentTeamId || !replicache) return

    if (userId === 'local-user') {
      toast.error('You cannot remove yourself from the team')
      return
    }

    try {
      await replicache.mutate.removeTeamMember({
        teamId: currentTeamId,
        userId
      })
      toast.success('Member removed')
    } catch (error) {
      console.error('Failed to remove member:', error)
      toast.error('Failed to remove member')
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={view === 'create' ? 'Create Team' : 'Teams'}>
      {view === 'list' && (
        <div className="space-y-4">
          {/* Create team button */}
          <Button onClick={() => setView('create')} className="w-full">
            <UserPlus className="w-4 h-4 mr-2" />
            Create New Team
          </Button>

          {/* Teams list */}
          {Array.from(teams.values()).length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No teams yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {Array.from(teams.values()).map((team) => (
                <button
                  key={team.id}
                  onClick={() => {
                    setCurrentTeam(team.id)
                    setView('members')
                  }}
                  className={cn(
                    'w-full text-left p-3 bg-gray-800 hover:bg-gray-700 rounded-lg border border-gray-700 transition-colors'
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-text">{team.name}</div>
                      <div className="text-xs text-gray-400">
                        {team.memberIds.length} {team.memberIds.length === 1 ? 'member' : 'members'}
                      </div>
                    </div>
                    <Users className="w-4 h-4 text-gray-400" />
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {view === 'create' && (
        <div className="space-y-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setView('list')}
          >
            ← Back to teams
          </Button>

          <Input
            label="Team name"
            value={newTeamName}
            onChange={(e) => setNewTeamName(e.target.value)}
            placeholder="My Team"
          />

          <Button onClick={handleCreateTeam} className="w-full">
            Create Team
          </Button>
        </div>
      )}

      {view === 'members' && currentTeam && (
        <div className="space-y-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setView('list')}
          >
            ← Back to teams
          </Button>

          {/* Team header */}
          <div className="p-4 bg-gray-800 rounded-lg border border-gray-700">
            <h3 className="font-semibold text-lg">{currentTeam.name}</h3>
            <p className="text-sm text-gray-400">
              {teamMembers.length} {teamMembers.length === 1 ? 'member' : 'members'}
            </p>
          </div>

          {/* Invite member */}
          <div className="p-4 bg-gray-800 rounded-lg border border-gray-700 space-y-3">
            <h4 className="font-medium text-sm flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Invite member
            </h4>
            <Input
              type="email"
              label="Email address"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="colleague@example.com"
            />
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">Role</label>
              <div className="flex gap-2">
                {(['admin', 'member', 'guest'] as TeamRole[]).map((role) => (
                  <button
                    key={role}
                    onClick={() => setInviteRole(role)}
                    className={cn(
                      'flex-1 px-3 py-2 rounded-lg text-sm border-2 transition-all',
                      inviteRole === role
                        ? 'border-primary bg-primary/10'
                        : 'border-gray-700 hover:border-gray-600'
                    )}
                  >
                    {ROLE_CONFIG[role].label}
                  </button>
                ))}
              </div>
            </div>
            <Button onClick={handleInviteMember} className="w-full">
              Send Invitation
            </Button>
          </div>

          {/* Members list */}
          <div className="space-y-3">
            <h4 className="font-medium text-sm">Members</h4>
            {teamMembers.length === 0 ? (
              <div className="text-center py-4 text-gray-400 text-sm">
                No members yet
              </div>
            ) : (
              <div className="space-y-2">
                {teamMembers.map((member) => {
                  const Icon = ROLE_CONFIG[member.role].icon
                  return (
                    <div
                      key={member.userId}
                      className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg border border-gray-700"
                    >
                      {member.userAvatar ? (
                        <img
                          src={member.userAvatar}
                          alt={member.userName}
                          className="w-10 h-10 rounded-full"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-sm font-bold text-white">
                          {member.userName.charAt(0).toUpperCase()}
                        </div>
                      )}

                      <div className="flex-1">
                        <div className="font-medium text-sm">{member.userName}</div>
                        <div className={cn('text-xs flex items-center gap-1', ROLE_CONFIG[member.role].color)}>
                          <Icon className="w-3 h-3" />
                          {ROLE_CONFIG[member.role].label}
                        </div>
                      </div>

                      {/* Role selector for non-owners */}
                      {member.role !== 'owner' && member.userId !== 'local-user' && (
                        <select
                          value={member.role}
                          onChange={(e) => handleUpdateRole(member.userId, e.target.value as TeamRole)}
                          className="px-2 py-1 bg-gray-700 border border-gray-600 rounded text-sm"
                        >
                          <option value="admin">Admin</option>
                          <option value="member">Member</option>
                          <option value="guest">Guest</option>
                        </select>
                      )}

                      {/* Remove button */}
                      {member.userId !== 'local-user' && (
                        <button
                          onClick={() => handleRemoveMember(member.userId)}
                          className="p-2 hover:bg-red-600 rounded transition-colors"
                          title="Remove from team"
                        >
                          <UserMinus className="w-4 h-4 text-gray-400" />
                        </button>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </Modal>
  )
}
