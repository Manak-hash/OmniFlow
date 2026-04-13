import { useState, useEffect, useRef } from 'react'
import CodeMirror from '@uiw/react-codemirror'
import { markdown } from '@codemirror/lang-markdown'
import { autocompletion } from '@codemirror/autocomplete'
import { Lock, History, MessageCircle, Calendar, Flag, UserPlus } from 'lucide-react'
import type { Node as NodeType, TaskState, TaskPriority } from '@/types/node'
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
  const [priority, setPriority] = useState<TaskPriority | null>(null)
  const [dueDate, setDueDate] = useState<string | null>(null)
  const [assignees, setAssignees] = useState<string[]>([])
  const [assigneeInput, setAssigneeInput] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [references, setReferences] = useState<string[]>([])
  const [lockError, setLockError] = useState<string | null>(null)
  type EditorView = 'edit' | 'history' | 'comments'
  const [currentView, setCurrentView] = useState<EditorView>('edit')

  // Track previous node ID to detect actual changes
  const previousNodeId = useRef<string | null>(null)

  // Node locking
  const { acquire, release, hasLock } = useNodeLock({
    nodeId: node?.id || null,
    userId: CURRENT_USER_ID,
    userName: CURRENT_USER_NAME,
    enabled: nodeEditorOpen && !!node,
    onLockAcquired: () => setLockError(null),
    onLockFailed: (lockedBy) => setLockError(`This node is being edited by ${lockedBy}`)
  })

  // Sync with node - only when node ID actually changes
  useEffect(() => {
    const nodeId = node?.id || null

    // Only update if the node ID actually changed
    if (previousNodeId.current !== nodeId) {
      previousNodeId.current = nodeId

      if (node) {
        setTitle(node.title)
        setContent(node.content)
        setState(node.state)
        setStateReason('')
        setProgressCurrent(node.progressCurrent)
        setProgressTarget(node.progressTarget)
        setPriority(node.priority)
        setDueDate(node.dueDate)
        setAssignees(node.assignees)
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
    }
  }, [node?.id, nodeEditorOpen]) // Only depend on node ID, not the whole node object

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
        priority,
        dueDate,
        assignees,
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

            {/* Priority */}
            <div>
              <label className="block text-sm font-medium mb-2 text-text flex items-center gap-2">
                <Flag className="w-4 h-4" />
                Priority
              </label>
              <div className="flex gap-2 flex-wrap">
                {[
                  { value: 'critical' as TaskPriority | null, label: 'Critical', color: 'bg-red-900/50 text-red-400 border-red-500' },
                  { value: 'high' as TaskPriority | null, label: 'High', color: 'bg-orange-900/50 text-orange-400 border-orange-500' },
                  { value: 'medium' as TaskPriority | null, label: 'Medium', color: 'bg-yellow-900/50 text-yellow-400 border-yellow-500' },
                  { value: 'low' as TaskPriority | null, label: 'Low', color: 'bg-gray-900/50 text-gray-400 border-gray-500' },
                  { value: null, label: 'None', color: 'bg-gray-800 text-gray-400 border-gray-600' }
                ].map(({ value, label, color }) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => setPriority(value)}
                    disabled={!hasLock}
                    className={cn(
                      'px-3 py-2 rounded-lg text-sm border transition-colors',
                      'hover:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed',
                      priority === value ? color : 'bg-gray-800 text-gray-400 border-gray-600'
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Due Date */}
            <div>
              <label className="block text-sm font-medium mb-2 text-text flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Due Date
              </label>
              <Input
                type="date"
                value={dueDate ? new Date(dueDate).toISOString().split('T')[0] : ''}
                onChange={(e) => setDueDate(e.target.value ? new Date(e.target.value).toISOString() : null)}
                disabled={!hasLock}
              />
              {dueDate && (
                <p className="text-xs text-gray-400 mt-1">
                  Due: {new Date(dueDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              )}
            </div>

            {/* Assignees */}
            <div>
              <label className="block text-sm font-medium mb-2 text-text flex items-center gap-2">
                <UserPlus className="w-4 h-4" />
                Assignees
              </label>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Input
                    value={assigneeInput}
                    onChange={(e) => setAssigneeInput(e.target.value)}
                    placeholder="Add assignee..."
                    disabled={!hasLock}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && assigneeInput.trim()) {
                        e.preventDefault()
                        if (!assignees.includes(assigneeInput.trim())) {
                          setAssignees([...assignees, assigneeInput.trim()])
                        }
                        setAssigneeInput('')
                      }
                    }}
                  />
                  <Button
                    type="button"
                    onClick={() => {
                      if (assigneeInput.trim() && !assignees.includes(assigneeInput.trim())) {
                        setAssignees([...assignees, assigneeInput.trim()])
                        setAssigneeInput('')
                      }
                    }}
                    disabled={!hasLock || !assigneeInput.trim()}
                  >
                    Add
                  </Button>
                </div>
                {assignees.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {assignees.map((assignee) => (
                      <div
                        key={assignee}
                        className="flex items-center gap-2 px-3 py-1.5 bg-gray-700 rounded-lg text-sm"
                      >
                        <span>{assignee}</span>
                        <button
                          type="button"
                          onClick={() => setAssignees(assignees.filter(a => a !== assignee))}
                          disabled={!hasLock}
                          className="text-gray-400 hover:text-red-400 disabled:opacity-50"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
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
