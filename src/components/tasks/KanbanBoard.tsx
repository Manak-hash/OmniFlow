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
import { useState, useMemo, useCallback } from 'react'
import { KanbanColumn } from './KanbanColumn'
import { KanbanCard } from './KanbanCard'
import { FilterBar } from './FilterBar'
import { BulkActionBar } from './BulkActionBar'
import { useKanbanStore } from '@/store/kanban'
import { filterNodes, groupNodesByField } from '@/utils/kanban'
import type { Node } from '@/types/node'
import type { TaskState, TaskPriority } from '@/types/node'
import { toast } from 'sonner'

interface KanbanBoardProps {
  nodes: Node[]
  selectedNodeId: string | null
  onNodeClick: (id: string) => void
  onMoveNode: (nodeId: string, newState: string) => void
  onAddNode: (state: string) => void
  onEditNode: (nodeId: string) => void
  onDuplicateNode: (nodeId: string) => void
  onArchiveNode: (nodeId: string) => void
  onDeleteNode: (nodeId: string) => void
  onUpdateNode: (nodeId: string, changes: Partial<Node>) => void
  allNodes: Node[]  // All nodes for parent lookup
}

export function KanbanBoard({
  nodes,
  onNodeClick,
  onMoveNode,
  onAddNode,
  onEditNode,
  onDuplicateNode,
  onArchiveNode,
  onDeleteNode,
  onUpdateNode,
  allNodes
}: KanbanBoardProps) {
  const {
    columns,
    filters,
    compactMode,
    colorBy,
    swimlaneBy,
    selectedCardIds,
    toggleCardSelection,
    clearCardSelection
  } = useKanbanStore()

  const [activeId, setActiveId] = useState<string | null>(null)
  const [isBulkMode, setIsBulkMode] = useState(false)

  // Filter nodes based on current filters
  const filteredNodes = useMemo(() => {
    return filterNodes(nodes, filters)
  }, [nodes, filters])

  // Group nodes by swimlane field if enabled
  const swimlanes = useMemo(() => {
    if (!swimlaneBy) return null
    return groupNodesByField(filteredNodes, swimlaneBy)
  }, [filteredNodes, swimlaneBy])

  // Group nodes by column (state)
  const nodesByColumn = useMemo(() => {
    const grouped = new Map<string, Node[]>()

    // Initialize empty arrays for each visible column
    columns
      .filter(col => col.visible)
      .forEach(col => grouped.set(col.id, []))

    // Group nodes by their state
    filteredNodes.forEach(node => {
      const state = node.state || 'not-started'
      if (grouped.has(state)) {
        grouped.get(state)!.push(node)
      }
    })

    return grouped
  }, [filteredNodes, columns])

  // Get visible columns in order
  const visibleColumns = useMemo(() => {
    return columns
      .filter(col => col.visible)
      .sort((a, b) => a.order - b.order)
  }, [columns])

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  )

  // Custom collision detection that ONLY detects columns, not cards
  const customCollisionDetection: any = (args: any) => {
    // Get all droppable containers
    const { droppableContainers } = args

    // Filter to ONLY include columns, not cards
    const columnContainers = droppableContainers.filter((container: any) =>
      visibleColumns.some(col => col.id === container.id)
    )

    // Use pointerWithin with filtered containers
    return closestCorners({
      ...args,
      droppableContainers: columnContainers
    })
  }

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event
    if (!over) return

    const activeId = active.id as string
    const overId = over.id as string


    // ONLY allow dropping on columns, NEVER on other cards
    const destColumn = visibleColumns.find(col => col.id === overId)
    if (!destColumn) {
      // Not over a column - completely ignore
      return
    }


    const sourceColumn = visibleColumns.find(col =>
      nodesByColumn.get(col.id)?.some(n => n.id === activeId)
    )

    if (!sourceColumn) return

    // If dropping on a different column, we'll handle it in DragEnd
    if (sourceColumn.id !== destColumn.id) return

    // SAME COLUMN - NO reordering allowed in Kanban view
    // This prevents card-to-card subtasking
    return
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setActiveId(null)

    if (!over) return

    const activeId = active.id as string
    const overId = over.id as string


    // STRICT: Only handle drops on COLUMNS, never on cards
    const destColumn = visibleColumns.find(col => col.id === overId)

    // If dropped on a column, update the node's state
    if (destColumn && destColumn.state) {
      onMoveNode(activeId, destColumn.state)
      return
    }

    // If dropped on anything else (including cards), do NOTHING
    // This prevents subtasking in Kanban view
  }

  const activeNode = activeId ? nodes.find(n => n.id === activeId) : null

  // Callback handlers for card actions
  const handleSetPriority = useCallback((nodeId: string, priority: TaskPriority) => {
    onUpdateNode(nodeId, { priority })
  }, [onUpdateNode])

  const handleSetProgress = useCallback((nodeId: string, current: number, target: number | null) => {
    onUpdateNode(nodeId, { progressCurrent: current, progressTarget: target })
  }, [onUpdateNode])

  const handleSetDueDate = useCallback((nodeId: string, dueDate: string | null) => {
    onUpdateNode(nodeId, { dueDate })
  }, [onUpdateNode])

  const handleCopyLink = useCallback((nodeId: string) => {
    const url = `${window.location.origin}/mindmap/${nodeId}`
    navigator.clipboard.writeText(url)
  }, [])

  const handleToggleSelection = useCallback((nodeId: string) => {
    toggleCardSelection(nodeId)
  }, [toggleCardSelection])

  const handleToggleBulkMode = useCallback(() => {
    if (isBulkMode) {
      clearCardSelection()
    }
    setIsBulkMode(!isBulkMode)
  }, [isBulkMode, clearCardSelection])

  // Bulk action handlers
  const handleBulkMove = useCallback((state: TaskState) => {
    selectedCardIds.forEach(nodeId => {
      onMoveNode(nodeId, state)
    })
  }, [selectedCardIds, onMoveNode])

  const handleBulkSetPriority = useCallback((priority: TaskPriority) => {
    selectedCardIds.forEach(nodeId => {
      onUpdateNode(nodeId, { priority })
    })
  }, [selectedCardIds, onUpdateNode])

  const handleBulkDelete = useCallback(() => {
    selectedCardIds.forEach(nodeId => {
      onDeleteNode(nodeId)
    })
  }, [selectedCardIds, onDeleteNode])

  const handleBulkArchive = useCallback(() => {
    selectedCardIds.forEach(nodeId => {
      onArchiveNode(nodeId)
    })
  }, [selectedCardIds, onArchiveNode])

  const handleBulkAddTag = useCallback(() => {
    const tag = prompt('Enter tag to add to all selected tasks:')
    if (tag) {
      selectedCardIds.forEach(nodeId => {
        const node = nodes.find(n => n.id === nodeId)
        if (node && !node.tags.includes(tag)) {
          onUpdateNode(nodeId, { tags: [...node.tags, tag] })
        }
      })
      toast.success(`Added tag to ${selectedCardIds.size} tasks`)
    }
  }, [selectedCardIds, nodes, onUpdateNode])

  return (
    <div className="h-full flex flex-col bg-omni-bg">
      {/* Filter bar */}
      <FilterBar
        nodes={nodes}
        onToggleBulkMode={handleToggleBulkMode}
        isBulkMode={isBulkMode}
        selectedCount={selectedCardIds.size}
      />

      {/* Kanban board */}
      <div className="flex-1 overflow-auto">
        <DndContext
          sensors={sensors}
          collisionDetection={customCollisionDetection}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          {swimlanes ? (
            // Render swimlanes
            <div className="flex flex-col">
              {swimlanes.map(group => (
                <div key={group.key} className="border-t border-omni-border first:border-t-0">
                  {/* Swimlane header */}
                  <div className="bg-omni-bg-secondary px-4 py-2 flex items-center gap-2 sticky top-0 z-10">
                    <h3 className="font-semibold text-omni-text">{group.label}</h3>
                    <span className="text-sm text-omni-text-tertiary">({group.nodes.length})</span>
                  </div>

                  {/* Swimlane columns */}
                  <div className="flex gap-4 p-4 overflow-x-auto">
                    {visibleColumns.map(column => (
                      <KanbanColumn
                        key={column.id}
                        id={column.id}
                        title={column.title}
                        nodes={group.nodes.filter(n => (n.state || 'not-started') === column.state)}
                        onNodeClick={onNodeClick}
                        onAddNode={() => onAddNode(column.state || 'not-started')}
                        color={column.color}
                        wipLimit={column.wipLimit}
                        onEdit={onEditNode}
                        onDelete={onDeleteNode}
                        onDuplicate={onDuplicateNode}
                        onArchive={onArchiveNode}
                        onSetPriority={handleSetPriority}
                        onSetProgress={handleSetProgress}
                        onSetDueDate={handleSetDueDate}
                        onCopyLink={handleCopyLink}
                        onToggleSelection={handleToggleSelection}
                        onUpdate={onUpdateNode}
                        isBulkMode={isBulkMode}
                        compactMode={compactMode}
                        colorBy={colorBy}
                        allNodes={allNodes}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            // Render regular columns
            <div className="flex gap-4 p-4 h-full">
              {visibleColumns.map(column => (
                <KanbanColumn
                  key={column.id}
                  id={column.id}
                  title={column.title}
                  nodes={nodesByColumn.get(column.id) || []}
                  onNodeClick={onNodeClick}
                  onAddNode={() => onAddNode(column.state || 'not-started')}
                  color={column.color}
                  wipLimit={column.wipLimit}
                  onEdit={onEditNode}
                  onDelete={onDeleteNode}
                  onDuplicate={onDuplicateNode}
                  onArchive={onArchiveNode}
                  onSetPriority={handleSetPriority}
                  onSetProgress={handleSetProgress}
                  onSetDueDate={handleSetDueDate}
                  onCopyLink={handleCopyLink}
                  onToggleSelection={handleToggleSelection}
                  onUpdate={onUpdateNode}
                  isBulkMode={isBulkMode}
                  compactMode={compactMode}
                  colorBy={colorBy}
                  allNodes={allNodes}
                />
              ))}
            </div>
          )}

          {/* Drag overlay */}
          <DragOverlay>
            {activeNode ? (
              <div className="rotate-3">
                <KanbanCard
                  node={activeNode}
                  onClick={() => {}}
                  isOverlay
                  onEdit={() => {}}
                  onDelete={() => {}}
                  onDuplicate={() => {}}
                  onArchive={() => {}}
                  onSetPriority={() => {}}
                  onSetProgress={() => {}}
                  onSetDueDate={() => {}}
                  onCopyLink={() => {}}
                  allNodes={allNodes}
                />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>

      {/* Bulk action bar */}
      {selectedCardIds.size > 0 && (
        <BulkActionBar
          selectedCount={selectedCardIds.size}
          onMoveToState={handleBulkMove}
          onSetPriority={handleBulkSetPriority}
          onDelete={handleBulkDelete}
          onArchive={handleBulkArchive}
          onClearSelection={clearCardSelection}
          onAddTag={handleBulkAddTag}
        />
      )}
    </div>
  )
}
