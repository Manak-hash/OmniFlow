import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Lock } from 'lucide-react'
import { MindMapCanvas } from '@/components/mindmap/MindMapCanvas'
import { NodeEditor } from '@/components/mindmap/NodeEditor'
import { useShareLinkStore } from '@/services/shareLinks'
import { useMindMap } from '@/hooks/useMindMap'
import { useUIStore } from '@/store/ui'
import { getReplicache } from '@/store/replicache'
import type { SharePermission } from '@/types/share'

export default function SharedMindmapPage() {
  const { token } = useParams()
  const { setSelectedNode } = useUIStore()
  const { getLinkByToken, incrementAccessCount } = useShareLinkStore()
  const [replicache, setReplicache] = useState<any>(null)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [shareLink, setShareLink] = useState<any>(null)
  const [permission, setPermission] = useState<SharePermission>('view')

  const mindmapId = shareLink?.mindmapId || null
  const { mindmap, nodes, loading: mindmapLoading } = useMindMap(mindmapId)

  useEffect(() => {
    getReplicache().then(setReplicache)
  }, [])

  useEffect(() => {
    if (!token) {
      setError('Invalid share link')
      setLoading(false)
      return
    }

    const link = getLinkByToken(token)
    if (!link) {
      setError('This link has expired or does not exist')
      setLoading(false)
      return
    }

    setShareLink(link)
    setPermission(link.permissions)

    // Increment access count
    incrementAccessCount(link.id)
    if (replicache) {
      replicache.mutate.incrementShareLinkAccess(link.id).catch(console.error)
    }

    setLoading(false)
  }, [token, replicache])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-text">Loading...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <Lock className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h1 className="text-xl font-semibold text-text mb-2">Link Not Found</h1>
          <p className="text-gray-400">{error}</p>
        </div>
      </div>
    )
  }

  if (mindmapLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-text">Loading mindmap...</div>
      </div>
    )
  }

  if (!mindmap) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-text">MindMap not found</div>
      </div>
    )
  }

  const canEdit = permission === 'edit'

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <header className="h-14 border-b border-gray-700 flex items-center justify-between px-4 bg-gray-900">
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-semibold text-text">{mindmap.name}</h1>
          <div className="flex items-center gap-2 px-3 py-1 bg-primary/20 text-primary rounded-full text-xs font-medium">
            <Lock className="w-3 h-3" />
            Shared - {permission}
          </div>
        </div>
      </header>

      {/* Canvas */}
      <div className="flex-1 relative">
        <MindMapCanvas
          nodes={nodes}
          selectedNodeId={null}
          onNodeClick={setSelectedNode}
          onCreateChild={canEdit && replicache ? (parentId) => {
            replicache.mutate.createNode({
              id: crypto.randomUUID(),
              parentId,
              title: '',
              content: '',
              contentType: 'markdown',
              state: null,
              stateHistory: [],
              progressTarget: null,
              progressCurrent: 0,
              priority: null,
              dueDate: null,
              tags: [],
              references: [],
              assignees: [],
              timeEstimated: null,
              timeSpent: 0,
              timeLogs: [],
              lockedBy: null,
              lockedAt: null,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            })
          } : () => {}}
          onDelete={canEdit && replicache ? (nodeId) => {
            replicache.mutate.deleteNode(nodeId)
          } : () => {}}
        />
      </div>

      {/* Node Editor - only for edit permission */}
      {canEdit && (
        <NodeEditor
          node={nodes.find(n => n.id === useUIStore.getState().selectedNodeId) || null}
          onUpdate={async (id, changes) => {
            if (!replicache) return
            await replicache.mutate.updateNode({ id, changes })
          }}
        />
      )}
    </div>
  )
}
