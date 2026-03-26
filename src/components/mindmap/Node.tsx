import { memo, useState } from 'react'
import { Handle, Position, NodeProps } from 'reactflow'
import { motion } from 'framer-motion'
import { cn } from '@/utils/cn'
import { Plus, Trash2, Lock } from 'lucide-react'
import { TaskStateBadge } from './TaskStateBadge'
import { ProgressBar } from './ProgressBar'
import { TagBadge } from './TagBadge'
import { ReferenceIndicator } from './ReferenceIndicator'
import { UserCursors } from '@/components/collab/UserCursors'
import { useLockStore } from '@/services/locks'
import type { Node as NodeType } from '@/types/node'

export interface MindMapNodeData {
  node: NodeType
  selected: boolean
  onClick: () => void
  onCreateChild: () => void
  onDelete: () => void
}

export const MindMapNode = memo(({ data, selected }: NodeProps<MindMapNodeData>) => {
  const { node } = data
  const { getLock } = useLockStore()
  const [isHovered, setIsHovered] = useState(false)
  const MAX_VISIBLE_TAGS = 3
  const visibleTags = node.tags.slice(0, MAX_VISIBLE_TAGS)
  const remainingTags = Math.max(0, node.tags.length - MAX_VISIBLE_TAGS)

  // Check if node is locked
  const lock = getLock(node.id)
  const isLocked = lock !== null

  // Enhanced entrance animation variants
  const nodeVariants = {
    hidden: {
      opacity: 0,
      scale: 0.8,
      y: 20
    },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0
    },
    hover: {
      scale: 1.02
    },
    selected: {
      scale: 1.05
    }
  }

  return (
    <motion.div
      initial="hidden"
      animate={selected ? "selected" : (isHovered ? "hover" : "visible")}
      variants={nodeVariants}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className={cn(
        'relative px-4 py-3 rounded-xl border-2 min-w-[150px] max-w-[280px]',
        'bg-gradient-to-br from-gray-800 to-gray-900',
        'border-gray-700 hover:border-gray-500',
        'cursor-pointer transition-all duration-300',
        'shadow-lg hover:shadow-2xl',
        'overflow-hidden group',
        selected && 'border-primary ring-2 ring-primary/50 shadow-primary/20',
        isLocked && 'opacity-75'
      )}
      onClick={data.onClick}
    >
      {/* Animated gradient overlay for special states */}
      {(node.state === 'finished-success' || node.state === 'in-progress') && (
        <motion.div
          className={cn(
            'absolute inset-0 rounded-xl opacity-10',
            node.state === 'finished-success' && 'bg-gradient-to-br from-green-500/20 to-emerald-500/20',
            node.state === 'in-progress' && 'bg-gradient-to-br from-blue-500/20 to-cyan-500/20'
          )}
          animate={{
            opacity: [0.05, 0.15, 0.05],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      )}

      {/* Enhanced border glow effect */}
      {selected && (
        <motion.div
          className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary via-accent to-primary opacity-20 blur-xl"
          animate={{
            opacity: [0.1, 0.3, 0.1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      )}
      {/* Input handle */}
      <Handle type="target" position={Position.Top} className="!bg-gray-600" />

      {/* Enhanced Lock indicator with pulse effect */}
      {isLocked && (
        <motion.div
          className="absolute -top-2 -right-2 z-10"
          animate={{
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <div className="relative">
            <motion.div
              className="absolute inset-0 rounded-full bg-yellow-600/30 blur-sm"
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.5, 0, 0.5],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            <div
              className="relative flex items-center justify-center w-6 h-6 rounded-full bg-yellow-600 border-2 border-gray-800 shadow-lg"
              title={`Locked by ${lock.userName}`}
            >
              <Lock className="w-3 h-3 text-white" />
            </div>
          </div>
        </motion.div>
      )}

      {/* User presence indicators */}
      <UserCursors nodeId={node.id} className="mb-2" />

      {/* Task State Badge */}
      {node.state && (
        <div className="mb-2">
          <TaskStateBadge state={node.state} size="sm" />
        </div>
      )}

      {/* Content */}
      <div className="mb-2">
        <div className="font-medium text-text truncate">{node.title || 'Untitled'}</div>
        {node.content && (
          <div className="text-sm text-gray-400 truncate mt-1">{node.content}</div>
        )}
      </div>

      {/* Progress Bar */}
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
        <div className="mb-2 flex flex-wrap gap-1">
          {visibleTags.map(tag => (
            <TagBadge key={tag} tag={tag} size="sm" />
          ))}
          {remainingTags > 0 && (
            <span className="text-xs text-gray-400 px-2 py-0.5">
              +{remainingTags}
            </span>
          )}
        </div>
      )}

      {/* Enhanced Actions with micro-interactions */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex gap-2">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={(e) => {
              e.stopPropagation()
              data.onCreateChild()
            }}
            className="relative p-1.5 bg-gray-700/50 hover:bg-gradient-to-br hover:from-primary hover:to-primary-hover rounded-lg transition-all duration-200 group-hover:opacity-100 opacity-0 group-hover:opacity-100"
            title="Add child node"
          >
            <Plus className="w-4 h-4 text-gray-300 group-hover:text-white transition-colors" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={(e) => {
              e.stopPropagation()
              data.onDelete()
            }}
            className="relative p-1.5 bg-gray-700/50 hover:bg-gradient-to-br hover:from-red-500 hover:to-red-600 rounded-lg transition-all duration-200 group-hover:opacity-100 opacity-0 group-hover:opacity-100"
            title="Delete node"
          >
            <Trash2 className="w-4 h-4 text-gray-300 group-hover:text-white transition-colors" />
          </motion.button>
        </div>

        {/* Reference Indicator */}
        {node.references.length > 0 && (
          <ReferenceIndicator count={node.references.length} size="sm" />
        )}
      </div>

      {/* Enhanced Output handle */}
      <Handle
        type="source"
        position={Position.Bottom}
        className={cn(
          '!bg-gray-600 !border-2 !border-gray-700',
          'hover:!bg-primary hover:!border-primary transition-all duration-200'
        )}
      />
    </motion.div>
  )
}, (prevProps, nextProps) => {
  // Custom comparison for better performance
  return (
    prevProps.data.node.id === nextProps.data.node.id &&
    prevProps.data.node.title === nextProps.data.node.title &&
    prevProps.data.node.content === nextProps.data.node.content &&
    prevProps.data.node.state === nextProps.data.node.state &&
    prevProps.data.node.progressCurrent === nextProps.data.node.progressCurrent &&
    prevProps.data.node.progressTarget === nextProps.data.node.progressTarget &&
    prevProps.data.node.tags.length === nextProps.data.node.tags.length &&
    prevProps.data.node.references.length === nextProps.data.node.references.length &&
    prevProps.selected === nextProps.selected
  )
})

MindMapNode.displayName = 'MindMapNode'
