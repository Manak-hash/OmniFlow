import { Button } from '@/components/ui/Button'
import { Check, X, ArrowRight, Trash2, Archive, Tag, Flag } from 'lucide-react'
import { useKanbanStore } from '@/store/kanban'
import type { TaskState, TaskPriority } from '@/types/node'
import { toast } from 'sonner'

interface BulkActionBarProps {
  selectedCount: number
  onMoveToState: (state: TaskState) => void
  onSetPriority: (priority: TaskPriority) => void
  onDelete: () => void
  onArchive: () => void
  onClearSelection: () => void
  onAddTag: () => void
}

export function BulkActionBar({
  selectedCount,
  onMoveToState,
  onSetPriority,
  onDelete,
  onArchive,
  onClearSelection,
  onAddTag
}: BulkActionBarProps) {
  const { clearCardSelection } = useKanbanStore()

  const handleMove = (state: TaskState) => {
    onMoveToState(state)
    toast.success(`Moved ${selectedCount} tasks to ${state.replace('-', ' ')}`)
  }

  const handleSetPriority = (priority: TaskPriority) => {
    onSetPriority(priority)
    toast.success(`Set priority for ${selectedCount} tasks`)
  }

  const handleDelete = () => {
    if (confirm(`Delete ${selectedCount} selected tasks?`)) {
      onDelete()
      toast.success(`Deleted ${selectedCount} tasks`)
      clearCardSelection()
    }
  }

  const handleArchive = () => {
    onArchive()
    toast.success(`Archived ${selectedCount} tasks`)
    clearCardSelection()
  }

  const states: TaskState[] = ['not-started', 'in-progress', 'stopped', 'finished-success', 'finished-failure']
  const priorities: TaskPriority[] = ['critical', 'high', 'medium', 'low']

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50">
      <div className="bg-omni-bg-secondary border border-omni-border rounded-lg shadow-2xl px-4 py-3 flex items-center gap-4">
        {/* Selection count */}
        <div className="flex items-center gap-2 pr-4 border-r border-omni-border">
          <div className="w-6 h-6 rounded bg-omni-primary flex items-center justify-center">
            <Check className="w-4 h-4 text-white" />
          </div>
          <span className="font-medium">{selectedCount} selected</span>
        </div>

        {/* Move to state */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-omni-text-tertiary">Move to:</span>
          <div className="flex gap-1">
            {states.map(state => (
              <Button
                key={state}
                variant="ghost"
                size="sm"
                onClick={() => handleMove(state)}
                className="text-xs"
              >
                <ArrowRight className="w-3 h-3 mr-1" />
                {state.replace('-', ' ')}
              </Button>
            ))}
          </div>
        </div>

        {/* Set priority */}
        <div className="flex items-center gap-2 border-l border-omni-border pl-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-1">
                <Flag className="w-4 h-4" />
                Priority
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {priorities.map(priority => (
                <DropdownMenuItem
                  key={priority}
                  onClick={() => handleSetPriority(priority)}
                  className="capitalize"
                >
                  {priority}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Add tag */}
        <div className="flex items-center gap-2 border-l border-omni-border pl-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onAddTag}
            className="gap-1"
          >
            <Tag className="w-4 h-4" />
            Add Tag
          </Button>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 border-l border-omni-border pl-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleArchive}
            className="gap-1 text-yellow-400 hover:text-yellow-300"
          >
            <Archive className="w-4 h-4" />
            Archive
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleDelete}
            className="gap-1 text-red-400 hover:text-red-300"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </Button>
        </div>

        {/* Clear selection */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearSelection}
          className="ml-2"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}

// Import DropdownMenu components
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/DropdownMenu'
