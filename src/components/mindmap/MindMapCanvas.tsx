import { useCallback, useMemo, useEffect, useRef } from 'react'
import ReactFlow, {
  Edge,
  addEdge,
  Connection,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  BackgroundVariant,
  NodeTypes,
} from 'reactflow'
import 'reactflow/dist/style.css'
import { MindMapNode } from './Node'
import type { Node as NodeType } from '@/types/node'
import { calculateTreeLayout } from '@/utils/layout/tree'
import { calculateForceLayout } from '@/utils/layout/force-directed'
import { calculateRadialLayout } from '@/utils/layout/radial'
import { useUIStore } from '@/store/ui'

// Define nodeTypes outside component to prevent re-creation
const nodeTypes: NodeTypes = {
  mindMapNode: MindMapNode,
}

interface MindMapCanvasProps {
  nodes: NodeType[]
  selectedNodeId: string | null
  onNodeClick: (id: string) => void
  onCreateChild: (parentId: string) => void
  onDelete: (id: string) => void
}

export function MindMapCanvas({
  nodes,
  selectedNodeId,
  onNodeClick,
  onCreateChild,
  onDelete,
}: MindMapCanvasProps) {
  const { layoutAlgorithm } = useUIStore()

  // Convert our nodes to ReactFlow nodes
  const flowNodes = useMemo(() => {
    let positions

    // Choose layout algorithm based on selection
    switch (layoutAlgorithm) {
      case 'force-directed':
        positions = calculateForceLayout(nodes, { width: 800, height: 600 })
        break
      case 'radial':
        positions = calculateRadialLayout(nodes, { width: 800, height: 600 })
        break
      case 'tree':
      default:
        positions = calculateTreeLayout(nodes)
        break
    }

    return nodes.map((node) => {
      const position = node.position || positions.get(node.id) || { x: 0, y: 0 }
      return {
        id: node.id,
        type: 'mindMapNode',
        position,
        data: {
          node,
          selected: node.id === selectedNodeId,
          onClick: () => onNodeClick(node.id),
          onCreateChild: () => onCreateChild(node.id),
          onDelete: () => onDelete(node.id),
        },
      }
    })
  }, [nodes, selectedNodeId, layoutAlgorithm])

  // Create edges based on parent-child relationships
  const flowEdges = useMemo(() => {
    const edges: Edge[] = []
    nodes.forEach((node) => {
      if (node.parentId) {
        edges.push({
          id: `${node.parentId}-${node.id}`,
          source: node.parentId,
          target: node.id,
          type: 'smoothstep',
          animated: false,
        })
      }
    })
    return edges
  }, [nodes])

  const [reactFlowNodes, setReactFlowNodes, onNodesChange] = useNodesState(flowNodes)
  const [reactFlowEdges, setReactFlowEdges, onEdgesChange] = useEdgesState(flowEdges)

  // Track previous node IDs to detect actual changes
  const prevNodeIdsRef = useRef<string | null>(null)
  const currentNodeIds = nodes.map(n => n.id).sort().join(',')

  // Sync React Flow state when nodes actually change
  useEffect(() => {
    if (prevNodeIdsRef.current !== currentNodeIds) {
      prevNodeIdsRef.current = currentNodeIds
      setReactFlowNodes(flowNodes)
      setReactFlowEdges(flowEdges)
    }
  }, [currentNodeIds, flowNodes, flowEdges, setReactFlowNodes, setReactFlowEdges])

  const onConnect = useCallback(
    (params: Connection) => setReactFlowEdges((eds) => addEdge(params, eds)),
    [setReactFlowEdges]
  )

  return (
    <div className="w-full h-full">
      <ReactFlow
        nodes={reactFlowNodes}
        edges={reactFlowEdges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
        className="bg-bg"
      >
        <Background variant={BackgroundVariant.Dots} gap={16} size={1} />
        <Controls />
      </ReactFlow>
    </div>
  )
}
