import { useState, useEffect } from 'react'
import CodeMirror from '@uiw/react-codemirror'
import { markdown } from '@codemirror/lang-markdown'
import { autocompletion } from '@codemirror/autocomplete'
import { Lock, History, MessageCircle } from 'lucide-react'
import type { Node as NodeType, TaskState } from '@/types/node'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { StateSelector } from './StateSelector'
import { ProgressEditor } from './ProgressEditor'
import { TagEditor } from './TagEditor'
import { ReferenceEditor } from './ReferenceEditor'
import { ChangeHistory } from '@/components/history/ChangeHistory'
import { CommentsPanel } from '@/components/comments/CommentsPanel'
import { useUIStore } from '@/store/ui'
import { useNodeLock } from '@/hooks/useNodeLock'
import { useLockStore } from '@/services/locks'
import { cn } from '@/utils/cn'

interface NodeEditorProps {
  node: NodeType | null
  onUpdate: (id: string, changes: Partial<NodeType>) => void
}

const CURRENT_USER_ID = 'local-user'
const CURRENT_USER_NAME = 'You'

export function NodeEditor({ node, onUpdate }: NodeEditorProps) {
  const { nodeEditorOpen, setNodeEditorOpen, allTags } = useUIStore()
  const { getLock } = useLockStore()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [state, setState] = useState<TaskState | null>(null)
  const [stateReason, setStateReason] = useState('')
  const [progressCurrent, setProgressCurrent] = useState(0)
  const [progressTarget, setProgressTarget] = useState<number | null>(null)
  const [tags, setTags] = useState<string[]>([])
  const [references, setReferences] = useState<string[]>([])
  const [lockError, setLockError] = useState<string | null>(null)
  type EditorView = 'edit' | 'history' | 'comments'
  const [currentView, setCurrentView] = useState<EditorView>('edit')

  // Node locking
  const { acquire, release, hasLock } = useNodeLock({
    nodeId: node?.id || null,
    userId: CURRENT_USER_ID,
    userName: CURRENT_USER_NAME,
    enabled: nodeEditorOpen && !!node,
    onLockAcquired: () => setLockError(null),
    onLockFailed: (lockedBy) => setLockError(`This node is being edited by ${lockedBy}`)
  })

  // Sync with node
  useEffect(() => {
    if (node) {
      setTitle(node.title)
      setContent(node.content)
      setState(node.state)
      setStateReason('')
      setProgressCurrent(node.progressCurrent)
      setProgressTarget(node.progressTarget)
      setTags(node.tags)
      setReferences(node.references)

      // Try to acquire lock when node changes
      if (nodeEditorOpen) {
        const existingLock = getLock(node.id)
        if (existingLock && existingLock.userId !== CURRENT_USER_ID) {
          setLockError(`This node is being edited by ${existingLock.userName}`)
        } else {
          acquire()
        }
      }
    }
  }, [node, nodeEditorOpen])

  const handleClose = () => {
    release()
    setLockError(null)
    setNodeEditorOpen(false)
  }

  const handleSave = () => {
    if (node && hasLock) {
      const changes: Partial<NodeType> = {
        title,
        content,
        progressCurrent,
        progressTarget,
        tags,
        references,
        lockedBy: null,
        lockedAt: null
      }

      // Only update state if it changed
      if (state !== node.state) {
        changes.state = state
        if (stateReason.trim()) {
          (changes as any).stateTransitionReason = stateReason.trim()
        }
      }

      onUpdate(node.id, changes)
      release()
      setLockError(null)
      setNodeEditorOpen(false)
    }
  }

  if (!node) return null

  return (
    <Modal
      isOpen={nodeEditorOpen}
      onClose={handleClose}
      title={
        currentView === 'history' ? 'Change History' :
        currentView === 'comments' ? 'Comments' :
        'Edit Node'
      }
    >
      {/* View toggle buttons */}
      <div className="flex justify-end gap-2 mb-4">
        <button
          onClick={() => setCurrentView('edit')}
          className={cn(
            'flex items-center gap-1 px-3 py-1.5 text-xs rounded transition-colors',
            currentView === 'edit'
              ? 'bg-primary text-white'
              : 'bg-gray-700 hover:bg-gray-600'
          )}
        >
          Edit
        </button>
        <button
          onClick={() => setCurrentView('history')}
          className={cn(
            'flex items-center gap-1 px-3 py-1.5 text-xs rounded transition-colors',
            currentView === 'history'
              ? 'bg-primary text-white'
              : 'bg-gray-700 hover:bg-gray-600'
          )}
        >
          <History className="w-3 h-3" />
          History
        </button>
        <button
          onClick={() => setCurrentView('comments')}
          className={cn(
            'flex items-center gap-1 px-3 py-1.5 text-xs rounded transition-colors',
            currentView === 'comments'
              ? 'bg-primary text-white'
              : 'bg-gray-700 hover:bg-gray-600'
          )}
        >
          <MessageCircle className="w-3 h-3" />
          Comments
        </button>
      </div>

      {/* Lock status indicator */}
      {hasLock && currentView === 'edit' && (
        <div className="mb-4 flex items-center gap-2 text-xs text-green-400 bg-green-900/20 border border-green-800 rounded-lg px-3 py-2">
          <Lock className="w-3 h-3" />
          <span>You have locked this node for editing</span>
        </div>
      )}

      {/* Change History View */}
      {currentView === 'history' ? (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-text">Change History</h3>
          <ChangeHistory nodeId={node?.id || ''} />
        </div>
      ) : currentView === 'comments' ? (
        /* Comments View */
        <CommentsPanel nodeId={node?.id || ''} />
      ) : (
        /* Edit Form */
        <>
          {lockError && (
            <div className="mb-4 p-3 bg-yellow-900/50 border border-yellow-700 rounded-lg flex items-start gap-2">
              <Lock className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-yellow-400">{lockError}</p>
                <p className="text-sm text-yellow-300/70 mt-1">
                  Only one person can edit a node at a time. Please wait for them to finish or try again in a few minutes.
                </p>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <Input
              label="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Node title..."
              disabled={!hasLock}
            />

            {/* Task State */}
            <div>
              <label className="block text-sm font-medium mb-2 text-text">
                Task State
              </label>
              <StateSelector
                value={state}
                onChange={setState}
                size="sm"
                disabled={!hasLock}
              />
            </div>

            {/* State Transition Reason (shown when changing state) */}
            {state && state !== node?.state && (
              <Input
                label="Reason for state change (optional)"
                value={stateReason}
                onChange={(e) => setStateReason(e.target.value)}
                placeholder="Why are you changing the state?"
                disabled={!hasLock}
              />
            )}

            {/* Progress Tracking */}
            <div>
              <label className="block text-sm font-medium mb-2 text-text">
                Progress
              </label>
              <ProgressEditor
                current={progressCurrent}
                target={progressTarget}
                onChange={(current, target) => {
                  setProgressCurrent(current)
                  setProgressTarget(target)
                }}
                size="sm"
                disabled={!hasLock}
              />
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium mb-2 text-text">
                Tags
              </label>
              <TagEditor
                tags={tags}
                allTags={allTags}
                onChange={setTags}
                disabled={!hasLock}
              />
            </div>

            {/* References */}
            <div>
              <label className="block text-sm font-medium mb-2 text-text">
                References
              </label>
              <ReferenceEditor
                references={references}
                currentNodeId={node?.id || ''}
                onChange={setReferences}
                disabled={!hasLock}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-text">
                Content (Markdown)
              </label>
              <CodeMirror
                value={content}
                onChange={(value) => setContent(value)}
                height="300px"
                editable={hasLock}
                extensions={[
                  markdown(),
                  autocompletion(),
                ]}
                className="bg-gray-800 rounded-lg"
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={handleClose}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={!hasLock}>
                Save
              </Button>
            </div>
          </div>
        </>
      )}
    </Modal>
  )
}
