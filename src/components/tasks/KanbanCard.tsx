import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { TaskStateBadge } from '@/components/mindmap/TaskStateBadge'
import { ProgressBar } from '@/components/mindmap/ProgressBar'
import { ReferenceIndicator } from '@/components/mindmap/ReferenceIndicator'
import { TagBadge } from '@/components/mindmap/TagBadge'
import { cn } from '@/utils/cn'
import type { Node } from '@/types/node'
import { GripVertical, Calendar, MessageSquare } from 'lucide-react'

interface KanbanCardProps {
  node: Node
  onClick: () => void
  isOverlay?: boolean
}

export function KanbanCard({ node, onClick, isOverlay = false }: KanbanCardProps) {
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

  const hasDueDate = node.updatedAt // Placeholder for actual due date
  const hasComments = false // Placeholder for comments

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'glass rounded-lg p-3 cursor-pointer hover:bg-omni-primary/10 transition-all',
        'border border-omni-border hover:border-omni-border-hover',
        isDragging && 'opacity-50 rotate-2',
        isOverlay && 'rotate-3 shadow-2xl'
      )}
      onClick={() => onClick()}
    >
      {/* Drag handle */}
      <div
        {...attributes}
        {...listeners}
        className="flex items-center justify-between mb-2 cursor-grab active:cursor-grabbing"
      >
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <GripVertical className="w-4 h-4 text-omni-text-secondary flex-shrink-0" />
          <h4 className="font-medium text-omni-text truncate text-sm">
            {node.title || 'Untitled'}
          </h4>
        </div>
      </div>

      {/* Content preview */}
      {node.content && (
        <p className="text-xs text-omni-text-secondary line-clamp-2 mb-2">
          {node.content}
        </p>
      )}

      {/* Badges row */}
      <div className="flex items-center gap-2 flex-wrap mb-2">
        {node.state && (
          <TaskStateBadge state={node.state} size="sm" showLabel={false} />
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
      {node.progressTarget && (
        <div className="mb-2">
          <ProgressBar
            current={node.progressCurrent}
            target={node.progressTarget}
            size="sm"
            showPercentage={false}
          />
        </div>
      )}

      {/* Tags */}
      {node.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {node.tags.slice(0, 2).map(tag => (
            <TagBadge key={tag} tag={tag} size="sm" />
          ))}
          {node.tags.length > 2 && (
            <span className="text-xs text-omni-text-tertiary">
              +{node.tags.length - 2}
            </span>
          )}
        </div>
      )}

      {/* Footer with metadata */}
      <div className="flex items-center justify-between text-xs text-omni-text-tertiary">
        <div className="flex items-center gap-2">
          {hasDueDate && (
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              <span>Due</span>
            </div>
          )}
          {hasComments && (
            <div className="flex items-center gap-1">
              <MessageSquare className="w-3 h-3" />
              <span>0</span>
            </div>
          )}
        </div>

        {node.references.length > 0 && (
          <ReferenceIndicator count={node.references.length} size="sm" />
        )}
      </div>
    </div>
  )
}
