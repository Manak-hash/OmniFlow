import { useState } from 'react'
import { Share2, Copy, Trash2, Plus, Calendar, Shield, Check } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { useShareLinkStore } from '@/services/shareLinks'
import { getReplicache } from '@/store/replicache'
import type { ShareLink, SharePermission } from '@/types/share'
import { formatDistanceToNow } from 'date-fns'
import { cn } from '@/utils/cn'
import { toast } from 'sonner'

interface ShareDialogProps {
  isOpen: boolean
  onClose: () => void
  mindmapId: string
  mindmapName: string
}

const PERMISSIONS: { value: SharePermission; label: string; description: string }[] = [
  { value: 'view', label: 'Can view', description: 'Recipients can only view' },
  { value: 'comment', label: 'Can comment', description: 'Recipients can view and comment' },
  { value: 'edit', label: 'Can edit', description: 'Recipients can fully edit' }
]

export function ShareDialog({ isOpen, onClose, mindmapId, mindmapName }: ShareDialogProps) {
  const { getActiveLinksForMindmap, getStats } = useShareLinkStore()
  const replicache = getReplicache()
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const [newLinkPermission, setNewLinkPermission] = useState<SharePermission>('view')
  const [newLinkExpiration, setNewLinkExpiration] = useState<string>('never') // never, 1day, 7days, 30days

  const links = getActiveLinksForMindmap(mindmapId)
  const stats = getStats(mindmapId)

  const handleCreateLink = async () => {
    try {
      const now = new Date()
      let expiresAt: string | null = null

      if (newLinkExpiration !== 'never') {
        const expirationDays = parseInt(newLinkExpiration)
        expiresAt = new Date(now.getTime() + expirationDays * 24 * 60 * 60 * 1000).toISOString()
      }

      const newLink: ShareLink = {
        id: crypto.randomUUID(),
        mindmapId,
        token: Math.random().toString(36).substring(2, 15),
        permissions: newLinkPermission,
        createdAt: now.toISOString(),
        expiresAt,
        accessCount: 0,
        createdBy: 'local-user',
        createdByUserName: 'You',
        isActive: true
      }

      await replicache.mutate.createShareLink(newLink)
      toast.success('Share link created')
    } catch (error) {
      console.error('Failed to create share link:', error)
      toast.error('Failed to create share link')
    }
  }

  const handleCopyLink = async (link: ShareLink) => {
    const url = `${window.location.origin}/shared/${link.token}`
    try {
      await navigator.clipboard.writeText(url)
      setCopiedId(link.id)
      toast.success('Link copied to clipboard')

      setTimeout(() => setCopiedId(null), 2000)
    } catch (error) {
      toast.error('Failed to copy link')
    }
  }

  const handleRevokeLink = async (linkId: string) => {
    try {
      await replicache.mutate.updateShareLink({
        id: linkId,
        updates: { isActive: false }
      })
      toast.success('Link revoked')
    } catch (error) {
      console.error('Failed to revoke link:', error)
      toast.error('Failed to revoke link')
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Share "${mindmapName}"`}>
      <div className="space-y-6">
        {/* Stats */}
        {stats.totalLinks > 0 && (
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-3 bg-gray-800 rounded-lg">
              <div className="text-2xl font-bold text-text">{stats.activeLinks}</div>
              <div className="text-xs text-gray-400">Active links</div>
            </div>
            <div className="text-center p-3 bg-gray-800 rounded-lg">
              <div className="text-2xl font-bold text-text">{stats.totalAccesses}</div>
              <div className="text-xs text-gray-400">Total views</div>
            </div>
            <div className="text-center p-3 bg-gray-800 rounded-lg">
              <div className="text-2xl font-bold text-text">{stats.totalLinks}</div>
              <div className="text-xs text-gray-400">Total links</div>
            </div>
          </div>
        )}

        {/* Create new link */}
        <div className="space-y-3 p-4 bg-gray-800 rounded-lg border border-gray-700">
          <h3 className="font-semibold text-text flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Create new link
          </h3>

          {/* Permission selector */}
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-300">
              <Shield className="w-4 h-4 inline mr-1" />
              Permission
            </label>
            <div className="space-y-2">
              {PERMISSIONS.map((perm) => (
                <button
                  key={perm.value}
                  onClick={() => setNewLinkPermission(perm.value)}
                  className={cn(
                    'w-full text-left px-3 py-2 rounded-lg border-2 transition-all',
                    newLinkPermission === perm.value
                      ? 'border-primary bg-primary/10'
                      : 'border-gray-700 hover:border-gray-600'
                  )}
                >
                  <div className="font-medium text-sm">{perm.label}</div>
                  <div className="text-xs text-gray-400">{perm.description}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Expiration selector */}
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-300">
              <Calendar className="w-4 h-4 inline mr-1" />
              Expiration
            </label>
            <div className="flex gap-2">
              {[
                { value: 'never', label: 'Never' },
                { value: '1', label: '1 day' },
                { value: '7', label: '7 days' },
                { value: '30', label: '30 days' }
              ].map((exp) => (
                <button
                  key={exp.value}
                  onClick={() => setNewLinkExpiration(exp.value)}
                  className={cn(
                    'flex-1 px-3 py-2 rounded-lg text-sm border-2 transition-all',
                    newLinkExpiration === exp.value
                      ? 'border-primary bg-primary/10 text-white'
                      : 'border-gray-700 hover:border-gray-600 text-gray-300'
                  )}
                >
                  {exp.label}
                </button>
              ))}
            </div>
          </div>

          <Button onClick={handleCreateLink} className="w-full">
            <Share2 className="w-4 h-4 mr-2" />
            Create Share Link
          </Button>
        </div>

        {/* Active links */}
        {links.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-semibold text-text">Active links ({links.length})</h3>
            <div className="space-y-2">
              {links.map((link) => (
                <div
                  key={link.id}
                  className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg border border-gray-700"
                >
                  {/* Link info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium text-gray-400 uppercase">
                        {link.permissions}
                      </span>
                      <span className="text-xs text-gray-500">
                        {formatDistanceToNow(new Date(link.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                    <div className="text-sm text-gray-400">
                      Accessed {link.accessCount} {link.accessCount === 1 ? 'time' : 'times'}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleCopyLink(link)}
                      className="p-2 hover:bg-gray-700 rounded transition-colors"
                      title="Copy link"
                    >
                      {copiedId === link.id ? (
                        <Check className="w-4 h-4 text-green-400" />
                      ) : (
                        <Copy className="w-4 h-4 text-gray-400" />
                      )}
                    </button>
                    <button
                      onClick={() => handleRevokeLink(link.id)}
                      className="p-2 hover:bg-red-600 rounded transition-colors"
                      title="Revoke link"
                    >
                      <Trash2 className="w-4 h-4 text-gray-400" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Modal>
  )
}
