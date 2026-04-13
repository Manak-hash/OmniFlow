import { useDroppable } from '@dnd-kit/core'
import type { Task } from '@/types/task'
import { STATE_CONFIGS } from '@/constants/states'
import { cn } from '@/utils/cn'
import { KanbanCard } from './KanbanCard'

interface KanbanColumnProps {
  state: Task['state']
  tasks: Task[]
  onEditTask: (task: Task) => void
}

export function KanbanColumn({ state, tasks, onEditTask }: KanbanColumnProps) {
  const config = STATE_CONFIGS[state]
  const StateIcon = config.icon

  const { setNodeRef, isOver } = useDroppable({
    id: `column-${state}`,
    data: {
      type: 'column',
      state
    }
  })

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'flex-shrink-0 min-w-[200px] sm:min-w-[240px] md:min-w-[280px] lg:min-w-[300px] flex-1 bg-omni-bg-secondary rounded-lg border border-omni-border transition-all duration-200',
        isOver && 'ring-4 ring-omni-primary/60 bg-omni-primary/5 scale-[1.02]'
      )}
    >
      {/* Column Header */}
      <div className="p-4 border-b border-omni-border sticky top-0 bg-omni-bg-secondary rounded-t-lg">
        <div className="flex items-center gap-2">
          <div className={cn(
            'p-1.5 rounded-lg',
            `bg-${config.color}-900/20`,
            `text-${config.color}-400`
          )}>
            <StateIcon className={cn('w-4 h-4', state === 'in-progress' && 'animate-spin')} />
          </div>
          <h3 className="font-semibold text-omni-text">{config.label}</h3>
          <span className="ml-auto text-sm text-omni-text-secondary">
            {tasks.length}
          </span>
        </div>
      </div>

      {/* Tasks */}
      <div className="p-3 space-y-2 min-h-[200px]">
        {tasks.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm text-omni-text/50">No tasks</p>
            <p className="text-xs text-omni-text/30 mt-1">Drop tasks here</p>
          </div>
        ) : (
          tasks.map((task) => (
            <KanbanCard
              key={task.id}
              task={task}
              onEditTask={onEditTask}
            />
          ))
        )}
      </div>
    </div>
  )
}
