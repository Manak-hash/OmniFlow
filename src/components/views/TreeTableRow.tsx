import { TaskStateBadge } from '@/components/mindmap/TaskStateBadge'
import { ProgressBar } from '@/components/mindmap/ProgressBar'
import { TagBadge } from '@/components/mindmap/TagBadge'
import { ReferenceIndicator } from '@/components/mindmap/ReferenceIndicator'
import { cn } from '@/utils/cn'
import type { FlatNode } from '@/utils/tree-table'
import { ChevronRight, ChevronDown } from 'lucide-react'

interface TreeTableRowProps {
  flatNode: FlatNode
  onToggle: (id: string) => void
  onEdit: (id: string) => void
  isSelected?: boolean
}

export function TreeTableRow({
  flatNode,
  onToggle,
  onEdit,
  isSelected = false
}: TreeTableRowProps) {
  const { node, depth, hasChildren, isExpanded } = flatNode

  return (
    <div
      className={cn(
        'flex items-center gap-4 px-4 py-3 border-b border-gray-700 cursor-pointer transition-colors',
        'hover:bg-gray-800',
        isSelected && 'bg-primary/20'
      )}
      style={{ paddingLeft: `${depth * 24 + 16}px` }}
      onClick={() => onEdit(node.id)}
    >
      {/* Expand/Collapse Toggle */}
      <div className="flex-shrink-0 w-6">
        {hasChildren ? (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onToggle(node.id)
            }}
            className="p-1 hover:bg-gray-700 rounded transition-colors"
            title={isExpanded ? 'Collapse' : 'Expand'}
          >
            {isExpanded ? (
              <ChevronDown className="w-4 h-4 text-gray-400" />
            ) : (
              <ChevronRight className="w-4 h-4 text-gray-400" />
            )}
          </button>
        ) : null}
      </div>

      {/* Title */}
      <div className="flex-1 min-w-0">
        <div className="font-medium text-text truncate">{node.title || 'Untitled'}</div>
        {node.content && (
          <div className="text-sm text-gray-400 truncate">{node.content}</div>
        )}
      </div>

      {/* State Badge */}
      <div className="flex-shrink-0">
        {node.state && <TaskStateBadge state={node.state} size="sm" />}
      </div>

      {/* Progress Bar */}
      <div className="flex-shrink-0 w-32">
        {node.progressTarget && (
          <ProgressBar
            current={node.progressCurrent}
            target={node.progressTarget}
            size="sm"
            showPercentage={false}
          />
        )}
      </div>

      {/* Tags */}
      <div className="flex-shrink-0 flex gap-1 max-w-[200px]">
        {node.tags.slice(0, 3).map(tag => (
          <TagBadge key={tag} tag={tag} size="sm" />
        ))}
        {node.tags.length > 3 && (
          <span className="text-xs text-gray-400">+{node.tags.length - 3}</span>
        )}
      </div>

      {/* References */}
      <div className="flex-shrink-0">
        {node.references.length > 0 && (
          <ReferenceIndicator count={node.references.length} size="sm" />
        )}
      </div>
    </div>
  )
}
