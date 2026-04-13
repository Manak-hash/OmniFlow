import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { KanbanCard } from './KanbanCard'
import { cn } from '@/utils/cn'
import type { Node } from '@/types/node'
import { Plus, ChevronDown, AlertCircle } from 'lucide-react'
import { useState } from 'react'

interface KanbanColumnProps {
  id: string
  title: string
  nodes: Node[]
  onNodeClick: (nodeId: string) => void
  onAddNode: () => void
  color: string
  wipLimit?: number | null
  onEdit: (nodeId: string) => void
  onDelete: (nodeId: string) => void
  onDuplicate: (nodeId: string) => void
  onArchive: (nodeId: string) => void
  onSetPriority: (nodeId: string, priority: any) => void
  onSetProgress: (nodeId: string, current: number, target: number | null) => void
  onSetDueDate: (nodeId: string, dueDate: string | null) => void
  onCopyLink: (nodeId: string) => void
  onToggleSelection?: (nodeId: string) => void
  onUpdate?: (nodeId: string, changes: Partial<Node>) => void
  isBulkMode?: boolean
  compactMode?: boolean
  colorBy?: 'priority' | 'tag' | null
  allNodes: Node[]  // All nodes for parent lookup
}

export function KanbanColumn({
  id,
  title,
  nodes,
  onNodeClick,
  onAddNode,
  color,
  wipLimit,
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
  isBulkMode = false,
  compactMode = false,
  colorBy = null,
  allNodes
}: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: id })
  const [isExpanded, setIsExpanded] = useState(true)

  // Calculate WIP limit status
  const isOverLimit = wipLimit !== null && wipLimit !== undefined && nodes.length > wipLimit
  const atLimit = wipLimit !== null && wipLimit !== undefined && nodes.length === wipLimit
  const countPercent = wipLimit ? Math.round((nodes.length / wipLimit) * 100) : 0

  return (
    <div
      className={cn(
        'flex flex-col w-80 min-w-80 max-w-80 bg-omni-bg-secondary/50 rounded-lg border border-omni-border transition-colors duration-200'
      )}
    >
      {/* Column header */}
      <div className={cn(
        'flex items-center justify-between p-3 border-b border-omni-border',
        isOver && 'bg-omni-primary/10'
      )}>
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {/* Expand/collapse button */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 hover:bg-omni-bg-tertiary rounded transition-colors"
          >
            <ChevronDown
              className={cn(
                'w-4 h-4 text-omni-text-secondary transition-transform',
                !isExpanded && '-rotate-90'
              )}
            />
          </button>

          {/* Column title */}
          <h3 className="font-semibold text-omni-text truncate">{title}</h3>

          {/* Task count with WIP indicator */}
          <div
            className={cn(
              'px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1',
              isOverLimit && 'bg-red-900/50 text-red-400 animate-pulse',
              atLimit && 'bg-yellow-900/50 text-yellow-400',
              !isOverLimit && !atLimit && `bg-${color}-900/50 text-${color}-400`
            )}
          >
            {wipLimit ? (
              <>
                <span>{nodes.length}</span>
                <span className="text-omni-text-tertiary">/</span>
                <span>{wipLimit}</span>
                {isOverLimit && <AlertCircle className="w-3 h-3" />}
              </>
            ) : (
              nodes.length
            )}
          </div>
        </div>

        {/* Progress bar for WIP limit */}
        {wipLimit && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-omni-bg-tertiary">
            <div
              className={cn(
                'h-full transition-all',
                isOverLimit ? 'bg-red-500' : atLimit ? 'bg-yellow-500' : `bg-${color}-500`
              )}
              style={{ width: `${Math.min(countPercent, 100)}%` }}
            />
          </div>
        )}

        {/* Add button */}
        <button
          onClick={onAddNode}
          className="p-1 hover:bg-omni-primary/20 rounded transition-colors text-omni-text-secondary hover:text-omni-primary"
          title="Add new task"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Column content */}
      <div
        ref={setNodeRef}
        className={cn(
          'flex-1 p-2 space-y-2 overflow-y-auto custom-scrollbar min-h-[200px]',
          isOver && 'bg-omni-primary/5'
        )}
      >
        {isExpanded && (
          <>
            {nodes.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-32 text-omni-text-tertiary text-sm border-2 border-dashed border-omni-border rounded-lg">
                {isOver ? (
                  <>
                    <p className="font-medium">Drop to add</p>
                    <p className="text-xs mt-1">Tasks will move to {title}</p>
                  </>
                ) : (
                  <>
                    <p className="font-medium">No tasks</p>
                    <p className="text-xs mt-1">Drop tasks here or click +</p>
                  </>
                )}
              </div>
            ) : (
              <SortableContext items={nodes.map(n => n.id)} strategy={verticalListSortingStrategy}>
                {nodes.map(node => (
                  <KanbanCard
                    key={node.id}
                    node={node}
                    onClick={() => onNodeClick(node.id)}
                    compact={compactMode}
                    isBulkMode={isBulkMode}
                    colorBy={colorBy}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onDuplicate={onDuplicate}
                    onArchive={onArchive}
                    onSetPriority={onSetPriority}
                    onSetProgress={onSetProgress}
                    onSetDueDate={onSetDueDate}
                    onCopyLink={onCopyLink}
                    onToggleSelection={onToggleSelection}
                    onUpdate={onUpdate}
                    allNodes={allNodes}
                  />
                ))}
              </SortableContext>
            )}

            {/* WIP limit warning */}
            {isOverLimit && (
              <div className="flex items-center gap-2 p-2 bg-red-900/20 border border-red-500/30 rounded-lg text-red-400 text-xs">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>Over WIP limit ({nodes.length}/{wipLimit})</span>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
