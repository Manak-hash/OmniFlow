import { TreePine, Circle, GitBranch } from 'lucide-react'
import { useUIStore } from '@/store/ui'
import type { LayoutAlgorithm } from '@/types/mindmap'
import { cn } from '@/utils/cn'

interface LayoutOption {
  value: LayoutAlgorithm
  icon: React.ComponentType<{ className?: string }>
  label: string
  description: string
}

const LAYOUTS: LayoutOption[] = [
  {
    value: 'tree',
    icon: TreePine,
    label: 'Tree',
    description: 'Hierarchical tree layout'
  },
  {
    value: 'force-directed',
    icon: Circle,
    label: 'Force',
    description: 'Force-directed graph layout'
  },
  {
    value: 'radial',
    icon: GitBranch,
    label: 'Radial',
    description: 'Circular radial layout'
  }
]

export function LayoutSwitcher({ className }: { className?: string }) {
  const { layoutAlgorithm, setLayoutAlgorithm } = useUIStore()

  return (
    <div className={cn('flex gap-1 bg-gray-800 rounded-lg p-1', className)}>
      {LAYOUTS.map(({ value, icon: Icon, label, description }) => (
        <button
          key={value}
          onClick={() => setLayoutAlgorithm(value)}
          className={cn(
            'px-3 py-1.5 rounded flex items-center gap-2 text-sm transition-all',
            'hover:bg-gray-700',
            layoutAlgorithm === value
              ? 'bg-primary text-white shadow-sm'
              : 'text-gray-400 hover:text-white'
          )}
          title={description}
        >
          <Icon className="w-4 h-4" />
          <span className="hidden sm:inline">{label}</span>
        </button>
      ))}
    </div>
  )
}
