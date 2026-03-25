import { memo } from 'react'
import { Handle, Position, NodeProps } from 'reactflow'
import { cn } from '@/utils/cn'
import { Plus, Trash2 } from 'lucide-react'

export interface MindMapNodeData {
  title: string
  content: string
  selected: boolean
  onClick: () => void
  onCreateChild: () => void
  onDelete: () => void
}

export const MindMapNode = memo(({ data, selected }: NodeProps<MindMapNodeData>) => {
  return (
    <div
      className={cn(
        'px-4 py-3 rounded-lg border-2 min-w-[150px] max-w-[250px]',
        'bg-gray-800 border-gray-700 hover:border-gray-600',
        'cursor-pointer transition-all',
        selected && 'border-primary ring-2 ring-primary/50'
      )}
      onClick={data.onClick}
    >
      {/* Input handle */}
      <Handle type="target" position={Position.Top} className="!bg-gray-600" />

      {/* Content */}
      <div className="mb-2">
        <div className="font-medium text-text truncate">{data.title || 'Untitled'}</div>
        {data.content && (
          <div className="text-sm text-gray-400 truncate mt-1">{data.content}</div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={(e) => {
            e.stopPropagation()
            data.onCreateChild()
          }}
          className="p-1 hover:bg-gray-700 rounded"
          title="Add child node"
        >
          <Plus className="w-4 h-4" />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation()
            data.onDelete()
          }}
          className="p-1 hover:bg-red-600 rounded"
          title="Delete node"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Output handle */}
      <Handle type="source" position={Position.Bottom} className="!bg-gray-600" />
    </div>
  )
})

MindMapNode.displayName = 'MindMapNode'
