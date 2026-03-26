import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { KanbanCard } from './KanbanCard'
import { cn } from '@/utils/cn'
import type { Node } from '@/types/node'
import { Plus, ChevronDown } from 'lucide-react'
import { useState } from 'react'

interface KanbanColumnProps {
  id: string
  title: string
  nodes: Node[]
  onNodeClick: (nodeId: string) => void
  onAddNode: () => void
  color: string
  count?: number
}

export function KanbanColumn({
  id,
  title,
  nodes,
  onNodeClick,
  onAddNode,
  color,
  count
}: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: id,
  })

  const [isExpanded, setIsExpanded] = useState(true)

  return (
    <div
      className={cn(
        'flex flex-col w-80 min-w-80 max-w-80 bg-omni-bg-secondary/50 rounded-lg border border-omni-border',
        'transition-colors duration-200'
      )}
    >
      {/* Column header */}
      <div className="flex items-center justify-between p-3 border-b border-omni-border">
        <div className="flex items-center gap-2 flex-1 min-w-0">
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
          <h3 className="font-semibold text-omni-text truncate">{title}</h3>
          <span
            className={cn(
              'px-2 py-0.5 rounded-full text-xs font-medium',
              `bg-${color}-900/50 text-${color}-400`
            )}
          >
            {count ?? nodes.length}
          </span>
        </div>

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
          <SortableContext items={nodes.map(n => n.id)} strategy={verticalListSortingStrategy}>
            {nodes.length === 0 ? (
              <div className="flex items-center justify-center h-32 text-omni-text-tertiary text-sm border-2 border-dashed border-omni-border rounded-lg">
                Drop tasks here
              </div>
            ) : (
              nodes.map(node => (
                <KanbanCard
                  key={node.id}
                  node={node}
                  onClick={() => onNodeClick(node.id)}
                />
              ))
            )}
          </SortableContext>
        )}
      </div>
    </div>
  )
}
