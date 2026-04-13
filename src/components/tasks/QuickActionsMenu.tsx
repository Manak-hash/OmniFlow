import { useState } from 'react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem
} from '@/components/ui/DropdownMenu'
import { Button } from '@/components/ui/Button'
import {
  MoreVertical,
  Edit2,
  Trash2,
  Copy,
  Archive,
  BarChart3,
  Calendar,
  Flag,
  Link2
} from 'lucide-react'
import { cn } from '@/utils/cn'
import type { Node, TaskPriority } from '@/types/node'
import { PRIORITIES } from '@/utils/kanban'
import { toast } from 'sonner'

interface QuickActionsMenuProps {
  node: Node
  onEdit: (nodeId: string) => void
  onDelete: (nodeId: string) => void
  onDuplicate: (nodeId: string) => void
  onArchive: (nodeId: string) => void
  onSetPriority: (nodeId: string, priority: TaskPriority) => void
  onSetProgress: (nodeId: string, current: number, target: number | null) => void
  onSetDueDate: (nodeId: string, dueDate: string | null) => void
  onCopyLink: (nodeId: string) => void
  className?: string
}

export function QuickActionsMenu({
  node,
  onEdit,
  onDelete,
  onDuplicate,
  onArchive,
  onSetPriority,
  onSetProgress,
  onSetDueDate,
  onCopyLink,
  className
}: QuickActionsMenuProps) {
  const [showPriorityPicker, setShowPriorityPicker] = useState(false)

  const handleDelete = () => {
    if (confirm(`Delete "${node.title || 'Untitled'}"?`)) {
      onDelete(node.id)
      toast.success('Task deleted')
    }
  }

  const handleDuplicate = () => {
    onDuplicate(node.id)
    toast.success('Task duplicated')
  }

  const handleArchive = () => {
    onArchive(node.id)
    toast.success('Task archived')
  }

  const handleCopyLink = () => {
    onCopyLink(node.id)
    toast.success('Link copied to clipboard')
  }

  const handleSetPriority = (priority: TaskPriority) => {
    onSetPriority(node.id, priority)
    const priorityLabel = priority ? priority.charAt(0).toUpperCase() + priority.slice(1) : 'None'
    toast.success(`Priority set to ${priorityLabel}`)
  }

  const handleCyclePriority = () => {
    const priorities: TaskPriority[] = ['low', 'medium', 'high', 'critical', null]
    const currentIndex = priorities.indexOf(node.priority)
    const nextIndex = (currentIndex + 1) % priorities.length
    const nextPriority = priorities[nextIndex]
    handleSetPriority(nextPriority)
  }

  const handleSetDueDate = (daysOffset: number | null) => {
    if (daysOffset === null) {
      onSetDueDate(node.id, null)
      toast.success('Due date removed')
      return
    }

    const date = new Date()
    date.setDate(date.getDate() + daysOffset)
    onSetDueDate(node.id, date.toISOString())
    toast.success(`Due date set to ${date.toLocaleDateString()}`)
  }

  const handleQuickProgress = () => {
    // Quick increment by 1 if has target, otherwise set target to 10
    if (node.progressTarget) {
      const newCurrent = Math.min(node.progressCurrent + 1, node.progressTarget)
      onSetProgress(node.id, newCurrent, node.progressTarget)
      if (newCurrent === node.progressTarget) {
        toast.success('Task completed! 🎉')
      } else {
        toast.success(`Progress: ${newCurrent}/${node.progressTarget}`)
      }
    } else {
      onSetProgress(node.id, 0, 10)
      toast.success('Progress tracking enabled (0/10)')
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            'opacity-0 group-hover:opacity-100 transition-opacity',
            'h-8 w-8 p-0 hover:bg-omni-bg-tertiary',
            className
          )}
        >
          <MoreVertical className="w-4 h-4 text-omni-text-secondary" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56">
        {/* Edit */}
        <DropdownMenuItem onClick={() => onEdit(node.id)}>
          <Edit2 className="w-4 h-4 mr-2" />
          Edit
        </DropdownMenuItem>

        {/* Quick Progress */}
        <DropdownMenuItem onClick={handleQuickProgress}>
          <BarChart3 className="w-4 h-4 mr-2" />
          Quick Progress
          <span className="ml-auto text-xs text-omni-text-tertiary">
            {node.progressTarget ? `${node.progressCurrent}/${node.progressTarget}` : 'Off'}
          </span>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {/* Priority Submenu */}
        <DropdownMenuSub open={showPriorityPicker} onOpenChange={setShowPriorityPicker}>
          <DropdownMenuSubTrigger>
            <Flag className="w-4 h-4 mr-2" />
            Priority
            <span className="ml-auto text-xs text-omni-text-tertiary">
              {node.priority ? node.priority.charAt(0).toUpperCase() + node.priority.slice(1).slice(0, 4) : 'None'}
            </span>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuItem onClick={handleCyclePriority}>
              Cycle Priority
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuRadioGroup value={node.priority || 'none'} onValueChange={(value) => handleSetPriority(value === 'none' ? null : value as TaskPriority)}>
              {PRIORITIES.map((priority) => {
                const label = priority ? priority.charAt(0).toUpperCase() + priority.slice(1) : 'None'
                return (
                  <DropdownMenuRadioItem key={priority || 'none'} value={priority || 'none'}>
                    {label}
                  </DropdownMenuRadioItem>
                )
              })}
            </DropdownMenuRadioGroup>
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        {/* Due Date Submenu */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <Calendar className="w-4 h-4 mr-2" />
            Due Date
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuItem onClick={() => handleSetDueDate(0)}>
              Today
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleSetDueDate(1)}>
              Tomorrow
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleSetDueDate(7)}>
              Next Week
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleSetDueDate(30)}>
              Next Month
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => handleSetDueDate(null)}>
              Remove Due Date
            </DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        <DropdownMenuSeparator />

        {/* Copy Link */}
        <DropdownMenuItem onClick={handleCopyLink}>
          <Link2 className="w-4 h-4 mr-2" />
          Copy Link
        </DropdownMenuItem>

        {/* Duplicate */}
        <DropdownMenuItem onClick={handleDuplicate}>
          <Copy className="w-4 h-4 mr-2" />
          Duplicate
        </DropdownMenuItem>

        {/* Archive */}
        <DropdownMenuItem onClick={handleArchive}>
          <Archive className="w-4 h-4 mr-2" />
          Archive
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {/* Delete */}
        <DropdownMenuItem onClick={handleDelete} className="text-red-400 focus:text-red-400">
          <Trash2 className="w-4 h-4 mr-2" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
