import { useState, useMemo, useRef } from 'react'
import { flattenTree } from '@/utils/tree-table'
import { TreeTableRow } from './TreeTableRow'
import { useUIStore } from '@/store/ui'
import type { Node } from '@/types/node'

interface TreeTableProps {
  nodes: Node[]
  selectedNodeId: string | null
  onNodeClick: (id: string) => void
}

const VIRTUALIZED_ROW_HEIGHT = 64 // pixels
const VIRTUALIZED_BUFFER = 5 // rows to render above/below viewport

export function TreeTable({
  nodes,
  selectedNodeId,
  onNodeClick
}: TreeTableProps) {
  const { expandedRowIds, toggleRowExpanded } = useUIStore()
  const [scrollTop, setScrollTop] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)

  // Flatten tree to array
  const flatNodes = useMemo(() => {
    return flattenTree(nodes, expandedRowIds)
  }, [nodes, expandedRowIds])

  // Virtualized rendering
  const containerHeight = 400 // Fixed height for now
  const visibleStart = Math.max(0, Math.floor(scrollTop / VIRTUALIZED_ROW_HEIGHT) - VIRTUALIZED_BUFFER)
  const visibleEnd = Math.min(
    flatNodes.length,
    Math.ceil((scrollTop + containerHeight) / VIRTUALIZED_ROW_HEIGHT) + VIRTUALIZED_BUFFER
  )
  const visibleNodes = flatNodes.slice(visibleStart, visibleEnd)

  const totalHeight = flatNodes.length * VIRTUALIZED_ROW_HEIGHT
  const offsetY = visibleStart * VIRTUALIZED_ROW_HEIGHT

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop)
  }

  const handleToggle = (nodeId: string) => {
    toggleRowExpanded(nodeId)
  }

  const handleExpandAll = () => {
    useUIStore.getState().setAllRowsExpanded(true)
  }

  const handleCollapseAll = () => {
    useUIStore.getState().setAllRowsExpanded(false)
  }

  if (nodes.length === 0) {
    return (
      <div className="flex items-center justify-center h-96 text-gray-400">
        <div className="text-center">
          <p className="text-lg font-medium mb-2">No nodes yet</p>
          <p className="text-sm">Create your first node to get started</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col bg-gray-900">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-700 bg-gray-800">
        <div className="text-sm text-gray-400">
          {nodes.length} nodes · {flatNodes.length} visible
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleExpandAll}
            className="text-xs px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded text-gray-300"
          >
            Expand All
          </button>
          <button
            onClick={handleCollapseAll}
            className="text-xs px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded text-gray-300"
          >
            Collapse All
          </button>
        </div>
      </div>

      {/* Header */}
      <div className="flex items-center gap-4 px-4 py-2 bg-gray-800 border-b border-gray-700 text-xs font-medium text-gray-400">
        <div className="w-6" />
        <div className="flex-1">Title</div>
        <div className="w-24">State</div>
        <div className="w-32">Progress</div>
        <div className="flex-1">Tags</div>
        <div className="w-16">Refs</div>
      </div>

      {/* Virtualized List */}
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto"
        onScroll={handleScroll}
        style={{ height: containerHeight }}
      >
        <div style={{ height: totalHeight, position: 'relative' }}>
          <div style={{ transform: `translateY(${offsetY}px)` }}>
            {visibleNodes.map((flatNode) => (
              <div
                key={flatNode.node.id}
                style={{
                  height: VIRTUALIZED_ROW_HEIGHT,
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0
                }}
              >
                <TreeTableRow
                  flatNode={flatNode}
                  onToggle={handleToggle}
                  onEdit={onNodeClick}
                  isSelected={flatNode.node.id === selectedNodeId}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
