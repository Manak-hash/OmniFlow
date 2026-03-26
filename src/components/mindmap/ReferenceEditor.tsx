import React, { useState } from 'react'
import { ReferenceIndicator } from './ReferenceIndicator'
import { NodeSelector } from './NodeSelector'
import { TagBadge } from './TagBadge'
import { getNode } from '@/store/replicache/queries'
import { getReplicache } from '@/store/replicache'
import type { Node } from '@/types/node'
import { cn } from '@/utils/cn'
import { Link, X, ExternalLink } from 'lucide-react'

interface ReferenceEditorProps {
  references: string[]
  currentNodeId: string
  onChange: (references: string[]) => void
  onNavigate?: (nodeId: string) => void
  className?: string
  disabled?: boolean
}

export function ReferenceEditor({
  references,
  currentNodeId,
  onChange,
  onNavigate,
  className,
  disabled = false
}: ReferenceEditorProps) {
  const [referencedNodes, setReferencedNodes] = useState<Node[]>([])
  const [loading, setLoading] = useState(false)
  const [showAdd, setShowAdd] = useState(false)
  const replicache = getReplicache()

  // Load referenced nodes
  const loadReferencedNodes = async () => {
    if (references.length === 0) {
      setReferencedNodes([])
      return
    }

    setLoading(true)
    try {
      const nodes = await Promise.all(
        references.map(refId => getNode(replicache, refId))
      )
      setReferencedNodes(nodes.filter((n): n is Node => n !== undefined))
    } catch (error) {
      console.error('Failed to load referenced nodes:', error)
      setReferencedNodes([])
    } finally {
      setLoading(false)
    }
  }

  // Load nodes when references change
  React.useEffect(() => {
    loadReferencedNodes()
  }, [references])

  const handleAddReference = (nodeId: string) => {
    if (disabled) return
    if (!references.includes(nodeId)) {
      onChange([...references, nodeId])
    }
    setShowAdd(false)
  }

  const handleRemoveReference = (nodeId: string) => {
    if (disabled) return
    onChange(references.filter(ref => ref !== nodeId))
  }

  return (
    <div className={cn('space-y-2', className)}>
      {/* Reference Count */}
      {references.length > 0 && (
        <div className="flex items-center gap-2">
          <ReferenceIndicator count={references.length} size="sm" />
        </div>
      )}

      {/* Reference List */}
      {loading ? (
        <div className="text-sm text-gray-400">Loading references...</div>
      ) : referencedNodes.length > 0 ? (
        <div className="space-y-2">
          {referencedNodes.map(node => (
            <div
              key={node.id}
              className="flex items-center gap-2 bg-gray-800 rounded-lg px-3 py-2"
            >
              <Link className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm text-text truncate">
                  {node.title || 'Untitled'}
                </div>
                {node.tags.length > 0 && (
                  <div className="flex gap-1 mt-1">
                    {node.tags.slice(0, 2).map(tag => (
                      <TagBadge key={tag} tag={tag} size="sm" />
                    ))}
                    {node.tags.length > 2 && (
                      <span className="text-xs text-gray-400">
                        +{node.tags.length - 2}
                      </span>
                    )}
                  </div>
                )}
              </div>
              <div className="flex gap-1">
                {onNavigate && (
                  <button
                    onClick={() => onNavigate(node.id)}
                    className="p-1 hover:bg-gray-700 rounded text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Go to node"
                    disabled={disabled}
                  >
                    <ExternalLink className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={() => handleRemoveReference(node.id)}
                  className="p-1 hover:bg-red-600 rounded text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-red-600"
                  title="Remove reference"
                  disabled={disabled}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : references.length > 0 ? (
        <div className="text-sm text-gray-400">
          Some referenced nodes could not be found
        </div>
      ) : null}

      {/* Add Reference Button */}
      {showAdd ? (
        <NodeSelector
          excludeId={currentNodeId}
          onSelect={handleAddReference}
          placeholder="Search for a node to reference..."
        />
      ) : (
        <button
          onClick={() => !disabled && setShowAdd(true)}
          disabled={disabled}
          className="w-full px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm text-gray-400 hover:text-white transition-colors border border-dashed border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-gray-800"
        >
          + Add Reference
        </button>
      )}
    </div>
  )
}
