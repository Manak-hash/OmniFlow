import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  closestCorners
} from '@dnd-kit/core'
import { arrayMove } from '@dnd-kit/sortable'
import { useState, useMemo } from 'react'
import { KanbanColumn } from './KanbanColumn'
import { KanbanCard } from './KanbanCard'
import type { Node } from '@/types/node'
import { Circle, Loader2, Ban, CheckCircle2, XCircle } from 'lucide-react'

interface KanbanBoardProps {
  nodes: Node[]
  selectedNodeId: string | null
  onNodeClick: (id: string) => void
  onMoveNode: (nodeId: string, newState: string) => void
  onAddNode: (state: string) => void
}

interface Column {
  id: string
  title: string
  state: string | null
  color: string
  icon: React.ComponentType<{ className?: string }>
}

const COLUMNS: Column[] = [
  { id: 'not-started', title: 'Not Started', state: 'not-started', color: 'gray', icon: Circle },
  { id: 'in-progress', title: 'In Progress', state: 'in-progress', color: 'blue', icon: Loader2 },
  { id: 'stopped', title: 'Stopped', state: 'stopped', color: 'yellow', icon: Ban },
  { id: 'finished-success', title: 'Done', state: 'finished-success', color: 'green', icon: CheckCircle2 },
  { id: 'finished-failure', title: 'Failed', state: 'finished-failure', color: 'red', icon: XCircle },
]

export function KanbanBoard({
  nodes,
  onNodeClick,
  onMoveNode,
  onAddNode
}: KanbanBoardProps) {
  const [activeId, setActiveId] = useState<string | null>(null)

  // Group nodes by state
  const nodesByColumn = useMemo(() => {
    const grouped = new Map<string, Node[]>()
    COLUMNS.forEach(col => grouped.set(col.id, []))

    nodes.forEach(node => {
      const state = node.state || 'not-started'
      if (grouped.has(state)) {
        grouped.get(state)!.push(node)
      }
    })

    return grouped
  }, [nodes])

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  )

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event
    if (!over) return

    const activeId = active.id as string
    const overId = over.id as string

    // Find the source and destination columns
    const sourceColumn = COLUMNS.find(col =>
      nodesByColumn.get(col.id)?.some(n => n.id === activeId)
    )
    const destColumn = COLUMNS.find(col => col.id === overId)

    if (!sourceColumn || !destColumn) return

    // If dropping on a different column, we'll handle it in DragEnd
    if (sourceColumn.id !== destColumn.id) return

    // Reorder within the same column
    const sourceNodes = nodesByColumn.get(sourceColumn.id)!
    const oldIndex = sourceNodes.findIndex(n => n.id === activeId)
    const newIndex = sourceNodes.findIndex(n => n.id === overId)

    if (oldIndex !== newIndex) {
      const newNodes = arrayMove(sourceNodes, oldIndex, newIndex)
      nodesByColumn.set(sourceColumn.id, newNodes)
    }
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setActiveId(null)

    if (!over) return

    const activeId = active.id as string
    const overId = over.id as string

    // Find source and destination columns
    const sourceColumn = COLUMNS.find(col =>
      nodesByColumn.get(col.id)?.some(n => n.id === activeId)
    )
    const destColumn = COLUMNS.find(col => col.id === overId)

    if (!sourceColumn || !destColumn) return

    // If moved to a different column, update the node's state
    if (sourceColumn.id !== destColumn.id && destColumn.state) {
      onMoveNode(activeId, destColumn.state)
    }
  }

  const activeNode = activeId ? nodes.find(n => n.id === activeId) : null

  return (
    <div className="h-full bg-omni-bg">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-4 p-4 h-full overflow-x-auto">
          {COLUMNS.map(column => (
            <KanbanColumn
              key={column.id}
              id={column.id}
              title={column.title}
              nodes={nodesByColumn.get(column.id) || []}
              onNodeClick={onNodeClick}
              onAddNode={() => onAddNode(column.state || 'not-started')}
              color={column.color}
            />
          ))}
        </div>

        <DragOverlay>
          {activeNode ? (
            <div className="rotate-3">
              <KanbanCard node={activeNode} onClick={() => {}} isOverlay />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  )
}
