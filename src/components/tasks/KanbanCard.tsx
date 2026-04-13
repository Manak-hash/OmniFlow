import { useState } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { TaskStateBadge } from '@/components/mindmap/TaskStateBadge'
import { ProgressBar } from '@/components/mindmap/ProgressBar'
import { ReferenceIndicator } from '@/components/mindmap/ReferenceIndicator'
import { TagBadge } from '@/components/mindmap/TagBadge'
import { QuickActionsMenu } from './QuickActionsMenu'
import { cn } from '@/utils/cn'
import { getDueDateInfo, getPriorityBorderColor } from '@/utils/kanban'
import type { Node, TaskPriority } from '@/types/node'
import { GripVertical, Calendar, MessageSquare, Flag } from 'lucide-react'

interface KanbanCardProps {
  node: Node
  onClick: () => void
  isOverlay?: boolean
  compact?: boolean
  isSelected?: boolean
  isBulkMode?: boolean
  colorBy?: 'priority' | 'tag' | null
  onEdit: (nodeId: string) => void
  onDelete: (nodeId: string) => void
  onDuplicate: (nodeId: string) => void
  onArchive: (nodeId: string) => void
  onSetPriority: (nodeId: string, priority: TaskPriority) => void
  onSetProgress: (nodeId: string, current: number, target: number | null) => void
  onSetDueDate: (nodeId: string, dueDate: string | null) => void
  onCopyLink: (nodeId: string) => void
  onToggleSelection?: (nodeId: string) => void
  onUpdate?: (nodeId: string, changes: Partial<Node>) => void
  allNodes: Node[]  // All nodes for parent lookup
}

export function KanbanCard({
  node,
  onClick,
  isOverlay = false,
  compact = false,
  isSelected = false,
  isBulkMode = false,
  colorBy = null,
  onEdit,
  onDelete,
  onDuplicate,
  onArchive,
  onSetPriority,
  onSetProgress,
  onSetDueDate,
  onCopyLink,
  onToggleSelection,
  onUpdate,
  allNodes
}: KanbanCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: node.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [editTitle, setEditTitle] = useState(node.title)

  const dueDateInfo = getDueDateInfo(node.dueDate)
  const hasDueDate = !!node.dueDate
  const hasComments = false // TODO: Implement comments
  const hasAssignees = node.assignees.length > 0

  // Find parent if this is a subtask
  const parentNode = node.parentId ? allNodes.find(n => n.id === node.parentId) : null

  // Handle inline title editing
  const handleTitleSubmit = () => {
    if (onUpdate && editTitle !== node.title) {
      onUpdate(node.id, { title: editTitle })
    }
    setIsEditingTitle(false)
  }

  const handleTitleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleTitleSubmit()
    } else if (e.key === 'Escape') {
      setEditTitle(node.title)
      setIsEditingTitle(false)
    }
  }

  // Get card border color based on colorBy setting
  const getBorderColor = () => {
    if (colorBy === 'priority' && node.priority) {
      return getPriorityBorderColor(node.priority)
    }
    if (colorBy === 'tag' && node.tags.length > 0) {
      // Use tag color (simplified - just use primary for now)
      return 'border-omni-primary'
    }
    return ''
  }

  // Compact mode rendering
  if (compact) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className={cn(
          'glass rounded-lg p-2 cursor-pointer hover:bg-omni-primary/10 transition-all border border-omni-border hover:border-omni-border-hover',
          isDragging && 'opacity-50',
          isOverlay && 'rotate-3 shadow-2xl',
          isSelected && 'ring-2 ring-omni-primary',
          getBorderColor()
        )}
        onClick={() => onClick()}
      >
        <div className="flex items-center gap-2">
          {/* Bulk selection checkbox */}
          {isBulkMode && onToggleSelection && (
            <input
              type="checkbox"
              checked={isSelected}
              onChange={() => onToggleSelection(node.id)}
              onClick={(e) => e.stopPropagation()}
              className="w-4 h-4 rounded border-omni-border bg-omni-bg-tertiary"
            />
          )}

          {/* Priority indicator */}
          {node.priority && (
            <Flag className={cn('w-3 h-3 flex-shrink-0', getPriorityBorderColor(node.priority).replace('border', 'text'))} />
          )}

          {/* Title */}
          <span className="flex-1 truncate text-sm font-medium">
            {node.title || 'Untitled'}
          </span>

          {/* Parent badge for subtasks in compact mode */}
          {parentNode && (
            <span className="text-xs px-1.5 py-0.5 rounded bg-omni-text/10 text-omni-text-secondary truncate max-w-[120px]" title={`Parent: ${parentNode.title || 'Untitled'}`}>
              {parentNode.title || 'Untitled'}
            </span>
          )}

          {/* State badge */}
          {node.state && (
            <TaskStateBadge state={node.state} size="sm" showLabel={false} />
          )}

          {/* Due date warning */}
          {dueDateInfo.status === 'overdue' && (
            <Calendar className="w-3 h-3 text-red-400" />
          )}
        </div>
      </div>
    )
  }

  // Full card rendering
  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'group glass rounded-lg p-3 cursor-pointer hover:bg-omni-primary/10 transition-all border border-omni-border hover:border-omni-border-hover relative',
        isDragging && 'opacity-50 rotate-2',
        isOverlay && 'rotate-3 shadow-2xl',
        isSelected && 'ring-2 ring-omni-primary',
        getBorderColor()
      )}
      onClick={() => onClick()}
    >
      {/* Bulk selection checkbox */}
      {isBulkMode && onToggleSelection && (
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onToggleSelection(node.id)}
          onClick={(e) => e.stopPropagation()}
          className="absolute top-3 left-3 w-4 h-4 rounded border-omni-border bg-omni-bg-tertiary"
        />
      )}

      {/* Quick actions menu */}
      <div className="absolute top-2 right-2">
        <QuickActionsMenu
          node={node}
          onEdit={onEdit}
          onDelete={onDelete}
          onDuplicate={onDuplicate}
          onArchive={onArchive}
          onSetPriority={onSetPriority}
          onSetProgress={onSetProgress}
          onSetDueDate={onSetDueDate}
          onCopyLink={onCopyLink}
        />
      </div>

      {/* Drag handle and title */}
      <div
        {...attributes}
        {...listeners}
        className="flex items-start gap-2 mb-2 cursor-grab active:cursor-grabbing pr-8"
      >
        <GripVertical className="w-4 h-4 text-omni-text-secondary flex-shrink-0 mt-0.5" />

        <div className="flex-1 min-w-0">
          {/* Inline editable title */}
          {isEditingTitle ? (
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onBlur={handleTitleSubmit}
              onKeyDown={handleTitleKeyDown}
              onClick={(e) => e.stopPropagation()}
              className="w-full bg-omni-bg-tertiary px-2 py-1 rounded text-sm font-medium outline-none focus:ring-1 focus:ring-omni-primary"
              autoFocus
            />
          ) : (
            <h4
              className="font-medium text-omni-text truncate text-sm"
              onDoubleClick={(e) => {
                e.stopPropagation()
                setIsEditingTitle(true)
              }}
            >
              {node.title || 'Untitled'}
            </h4>
          )}
        </div>
      </div>

      {/* Content preview */}
      {node.content && !isEditingTitle && (
        <p className="text-xs text-omni-text-secondary line-clamp-2 mb-2 pl-6">
          {node.content}
        </p>
      )}

      {/* Badges row */}
      <div className="flex items-center gap-2 flex-wrap mb-2 pl-6">
        {node.state && (
          <TaskStateBadge state={node.state} size="sm" showLabel={false} />
        )}

        {/* Parent badge - show if this is a subtask */}
        {parentNode && (
          <div className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-omni-text/10 text-omni-text-secondary" title={`Parent: ${parentNode.title || 'Untitled'}`}>
            <span>{parentNode.title || 'Untitled'}</span>
          </div>
        )}

        {node.priority && (
          <div className={cn(
            'flex items-center gap-1 text-xs px-2 py-0.5 rounded-full',
            getPriorityBorderColor(node.priority).replace('border', 'bg').replace('-500', '-900/30'),
            getPriorityBorderColor(node.priority).replace('border', 'text')
          )}>
            <Flag className="w-3 h-3" />
            <span className="capitalize">{node.priority}</span>
          </div>
        )}

        {node.progressTarget && (
          <div className="flex items-center gap-1 text-xs text-omni-text-secondary">
            <span className="font-medium">
              {node.progressCurrent}/{node.progressTarget}
            </span>
          </div>
        )}
      </div>

      {/* Progress bar (if applicable) */}
      {node.progressTarget && !isEditingTitle && (
        <div className="mb-2 pl-6">
          <ProgressBar
            current={node.progressCurrent}
            target={node.progressTarget}
            size="sm"
            showPercentage={false}
          />
        </div>
      )}

      {/* Tags */}
      {node.tags.length > 0 && !isEditingTitle && (
        <div className="flex flex-wrap gap-1 mb-2 pl-6">
          {node.tags.slice(0, 3).map(tag => (
            <TagBadge key={tag} tag={tag} size="sm" />
          ))}
          {node.tags.length > 3 && (
            <span className="text-xs text-omni-text-tertiary">
              +{node.tags.length - 3}
            </span>
          )}
        </div>
      )}

      {/* Footer with metadata */}
      {!isEditingTitle && (
        <div className="flex items-center justify-between text-xs text-omni-text-tertiary pl-6">
          <div className="flex items-center gap-2">
            {/* Due date */}
            {hasDueDate && (
              <div className={cn('flex items-center gap-1', dueDateInfo.color)}>
                <Calendar className="w-3 h-3" />
                <span>{dueDateInfo.text}</span>
              </div>
            )}

            {/* Assignees */}
            {hasAssignees && (
              <div className="flex items-center gap-1">
                <div className="flex -space-x-1">
                  {node.assignees.slice(0, 2).map((assignee, i) => (
                    <div
                      key={i}
                      className="w-5 h-5 rounded-full bg-omni-primary flex items-center justify-center text-[10px] font-medium border border-omni-bg"
                    >
                      {assignee.charAt(0).toUpperCase()}
                    </div>
                  ))}
                </div>
                {node.assignees.length > 2 && (
                  <span className="text-xs">+{node.assignees.length - 2}</span>
                )}
              </div>
            )}

            {/* Comments placeholder */}
            {hasComments && (
              <div className="flex items-center gap-1">
                <MessageSquare className="w-3 h-3" />
                <span>0</span>
              </div>
            )}
          </div>

          {/* References */}
          {node.references.length > 0 && (
            <ReferenceIndicator count={node.references.length} size="sm" />
          )}
        </div>
      )}
    </div>
  )
}
