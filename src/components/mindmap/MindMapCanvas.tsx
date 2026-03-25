import { useCallback, useMemo, useEffect } from 'react'
import ReactFlow, {
  Edge,
  addEdge,
  Connection,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  BackgroundVariant,
} from 'reactflow'
import 'reactflow/dist/style.css'
import { MindMapNode } from './Node'
import type { Node as NodeType } from '@/types/node'
import { calculateTreeLayout } from '@/utils/layout/tree'

interface MindMapCanvasProps {
  nodes: NodeType[]
  selectedNodeId: string | null
  onNodeClick: (id: string) => void
  onCreateChild: (parentId: string) => void
  onDelete: (id: string) => void
}

const nodeTypes = {
  mindMapNode: MindMapNode,
}

export function MindMapCanvas({
  nodes,
  selectedNodeId,
  onNodeClick,
  onCreateChild,
  onDelete,
}: MindMapCanvasProps) {
  // Convert our nodes to ReactFlow nodes
  const flowNodes = useMemo(() => {
    const positions = calculateTreeLayout(nodes)

    return nodes.map((node) => ({
      id: node.id,
      type: 'mindMapNode',
      position: node.position || positions.get(node.id) || { x: 0, y: 0 },
      data: {
        ...node,
        selected: node.id === selectedNodeId,
        onClick: () => onNodeClick(node.id),
        onCreateChild: () => onCreateChild(node.id),
        onDelete: () => onDelete(node.id),
      },
    }))
  }, [nodes, selectedNodeId, onNodeClick, onCreateChild, onDelete])

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

  // Sync React Flow state when nodes/edges props change
  useEffect(() => {
    setReactFlowNodes(flowNodes)
    setReactFlowEdges(flowEdges)
  }, [flowNodes, flowEdges, setReactFlowNodes, setReactFlowEdges])

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
