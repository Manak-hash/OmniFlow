import { useMemo } from 'react'
import { useReactFlow } from 'reactflow'
import { calculateTreeLayout } from '@/utils/layout/tree'
import { calculateViewportBounds } from '@/utils/viewport'
import { STATE_CONFIG } from '@/utils/state'
import { cn } from '@/utils/cn'
import type { Node } from '@/types/node'

interface PanoramicViewProps {
  nodes: Node[]
  onClose?: () => void
  className?: string
}

const MINIMAP_WIDTH = 256
const MINIMAP_HEIGHT = 192
const NODE_WIDTH = 20
const NODE_HEIGHT = 12

export function PanoramicView({ nodes, onClose, className }: PanoramicViewProps) {
  const { zoomIn, zoomOut, fitView } = useReactFlow()

  // Calculate positions and bounds
  const { positions, bounds } = useMemo(() => {
    const pos = calculateTreeLayout(nodes)
    const b = calculateViewportBounds(nodes, pos)
    return { positions: pos, bounds: b }
  }, [nodes])

  // Calculate scale to fit bounds in minimap
  const scaleX = MINIMAP_WIDTH / bounds.width
  const scaleY = MINIMAP_HEIGHT / bounds.height
  const scale = Math.min(scaleX, scaleY)

  // Calculate offset to center the content
  const offsetX = (MINIMAP_WIDTH - bounds.width * scale) / 2 - bounds.minX * scale
  const offsetY = (MINIMAP_HEIGHT - bounds.height * scale) / 2 - bounds.minY * scale

  const handleNodeClick = (nodeId: string) => {
    fitView({ nodes: [{ id: nodeId }], duration: 500 })
  }

  return (
    <div
      className={cn(
        'fixed bottom-4 right-4 bg-gray-900 border border-gray-700 rounded-lg overflow-hidden shadow-xl',
        className
      )}
      style={{ width: MINIMAP_WIDTH, height: MINIMAP_HEIGHT }}
    >
      {/* Close button */}
      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-1 right-1 p-1 bg-gray-800 hover:bg-gray-700 rounded text-gray-400 hover:text-white z-10"
          title="Close panoramic view"
        >
          ×
        </button>
      )}

      {/* Zoom controls */}
      <div className="absolute bottom-1 right-1 flex gap-1 z-10">
        <button
          onClick={() => zoomIn({ duration: 300 })}
          className="p-1 bg-gray-800 hover:bg-gray-700 rounded text-gray-400 hover:text-white text-xs"
          title="Zoom in"
        >
          +
        </button>
        <button
          onClick={() => zoomOut({ duration: 300 })}
          className="p-1 bg-gray-800 hover:bg-gray-700 rounded text-gray-400 hover:text-white text-xs"
          title="Zoom out"
        >
          −
        </button>
        <button
          onClick={() => fitView({ duration: 500 })}
          className="p-1 bg-gray-800 hover:bg-gray-700 rounded text-gray-400 hover:text-white text-xs"
          title="Fit view"
        >
          ⛶
        </button>
      </div>

      {/* SVG minimap */}
      <svg
        viewBox={`0 0 ${MINIMAP_WIDTH} ${MINIMAP_HEIGHT}`}
        className="w-full h-full bg-gray-800"
      >
        {/* Grid lines */}
        <defs>
          <pattern
            id="minimap-grid"
            width="20"
            height="20"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 20 0 L 0 0 0 20"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.5"
              className="text-gray-700"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#minimap-grid)" />

        {/* Transform group for proper scaling and positioning */}
        <g transform={`translate(${offsetX}, ${offsetY})`}>
          {/* Edges */}
          {nodes.map(node => {
            if (node.parentId) {
              const parentPos = positions.get(node.parentId)
              const nodePos = positions.get(node.id)
              if (parentPos && nodePos) {
                return (
                  <line
                    key={`${node.parentId}-${node.id}`}
                    x1={parentPos.x * scale + NODE_WIDTH / 2}
                    y1={parentPos.y * scale + NODE_HEIGHT / 2}
                    x2={nodePos.x * scale + NODE_WIDTH / 2}
                    y2={nodePos.y * scale + NODE_HEIGHT / 2}
                    stroke="currentColor"
                    strokeWidth="1"
                    className="text-gray-600"
                  />
                )
              }
            }
            return null
          })}

          {/* Nodes */}
          {nodes.map(node => {
            const pos = positions.get(node.id)
            if (!pos) return null

            const color = node.state
              ? STATE_CONFIG[node.state].color
              : 'gray'

            return (
              <g
                key={node.id}
                onClick={() => handleNodeClick(node.id)}
                className="cursor-pointer hover:opacity-80"
                style={{ transform: `translate(${pos.x * scale}px, ${pos.y * scale}px)` }}
              >
                <rect
                  width={NODE_WIDTH}
                  height={NODE_HEIGHT}
                  fill={`currentColor`}
                  stroke={`currentColor`}
                  strokeWidth="1"
                  className={`text-${color}-500`}
                  rx="2"
                />
              </g>
            )
          })}
        </g>
      </svg>

      {/* Node count indicator */}
      <div className="absolute top-1 left-1 text-xs text-gray-400 bg-gray-800 px-1.5 py-0.5 rounded">
        {nodes.length} nodes
      </div>
    </div>
  )
}
