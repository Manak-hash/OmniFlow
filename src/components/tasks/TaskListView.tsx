import { useState, useMemo } from 'react'
import { TaskStateBadge } from '@/components/mindmap/TaskStateBadge'
import { ProgressBar } from '@/components/mindmap/ProgressBar'
import { TagBadge } from '@/components/mindmap/TagBadge'
import { ReferenceIndicator } from '@/components/mindmap/ReferenceIndicator'
import { cn } from '@/utils/cn'
import type { Node } from '@/types/node'
import {
  LayoutGrid,
  List,
  SortAsc,
  SortDesc,
  Filter,
  Check
} from 'lucide-react'

type ViewLayout = 'grid' | 'list'
type SortField = 'title' | 'updatedAt' | 'progress' | 'state'
type SortOrder = 'asc' | 'desc'

interface TaskListViewProps {
  nodes: Node[]
  selectedNodeId: string | null
  onNodeClick: (id: string) => void
}

interface FilterState {
  states: string[]
  tags: string[]
  progressMin: number
  progressMax: number
  searchQuery: string
}

export function TaskListView({
  nodes,
  selectedNodeId,
  onNodeClick
}: TaskListViewProps) {
  const [layout, setLayout] = useState<ViewLayout>('list')
  const [sortField, setSortField] = useState<SortField>('updatedAt')
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  // Filter state
  const [filters, setFilters] = useState<FilterState>({
    states: [],
    tags: [],
    progressMin: 0,
    progressMax: 100,
    searchQuery: ''
  })

  const [showFilters, setShowFilters] = useState(false)
  const [showSortMenu, setShowSortMenu] = useState(false)

  // Get all unique tags
  const allTags = useMemo(() => {
    const tagSet = new Set<string>()
    nodes.forEach(node => node.tags.forEach(tag => tagSet.add(tag)))
    return Array.from(tagSet).sort()
  }, [nodes])

  // Filter and sort nodes
  const filteredAndSortedNodes = useMemo(() => {
    let filtered = nodes

    // Apply search
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase()
      filtered = filtered.filter(node =>
        node.title.toLowerCase().includes(query) ||
        node.content.toLowerCase().includes(query)
      )
    }

    // Apply state filter
    if (filters.states.length > 0) {
      filtered = filtered.filter(node =>
        node.state ? filters.states.includes(node.state) : filters.states.includes('none')
      )
    }

    // Apply tag filter
    if (filters.tags.length > 0) {
      filtered = filtered.filter(node =>
        filters.tags.some(tag => node.tags.includes(tag))
      )
    }

    // Apply progress filter
    filtered = filtered.filter(node => {
      if (!node.progressTarget) return true
      const percentage = (node.progressCurrent / node.progressTarget) * 100
      return percentage >= filters.progressMin && percentage <= filters.progressMax
    })

    // Sort
    filtered = [...filtered].sort((a, b) => {
      let comparison = 0

      switch (sortField) {
        case 'title':
          comparison = a.title.localeCompare(b.title)
          break
        case 'updatedAt':
          comparison = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()
          break
        case 'progress':
          const aProgress = a.progressTarget ? (a.progressCurrent / a.progressTarget) * 100 : 0
          const bProgress = b.progressTarget ? (b.progressCurrent / b.progressTarget) * 100 : 0
          comparison = aProgress - bProgress
          break
        case 'state':
          const stateOrder = ['finished-success', 'finished-failure', 'in-progress', 'stopped', 'not-started']
          const aIndex = a.state ? stateOrder.indexOf(a.state) : stateOrder.length
          const bIndex = b.state ? stateOrder.indexOf(b.state) : stateOrder.length
          comparison = aIndex - bIndex
          break
      }

      return sortOrder === 'asc' ? comparison : -comparison
    })

    return filtered
  }, [nodes, filters, sortField, sortOrder])

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortOrder('asc')
    }
  }

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedIds(newSelected)
  }

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredAndSortedNodes.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(filteredAndSortedNodes.map(n => n.id)))
    }
  }

  const hasActiveFilters =
    filters.states.length > 0 ||
    filters.tags.length > 0 ||
    filters.searchQuery !== ''

  return (
    <div className="h-full flex flex-col bg-omni-bg">
      {/* Toolbar */}
      <div className="flex items-center justify-between p-4 border-b border-omni-border bg-omni-bg-secondary/50">
        <div className="flex items-center gap-4">
          {/* Layout toggle */}
          <div className="flex bg-omni-bg rounded-lg p-1">
            <button
              onClick={() => setLayout('list')}
              className={cn(
                'p-2 rounded transition-colors',
                layout === 'list' ? 'bg-omni-primary text-white' : 'text-omni-text-secondary hover:text-omni-text'
              )}
              title="List view"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setLayout('grid')}
              className={cn(
                'p-2 rounded transition-colors',
                layout === 'grid' ? 'bg-omni-primary text-white' : 'text-omni-text-secondary hover:text-omni-text'
              )}
              title="Grid view"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>

          {/* Search */}
          <input
            type="text"
            placeholder="Search tasks..."
            value={filters.searchQuery}
            onChange={(e) => setFilters({ ...filters, searchQuery: e.target.value })}
            className="px-3 py-1.5 bg-omni-bg border border-omni-border rounded-lg text-sm text-omni-text placeholder:text-omni-text-tertiary focus:outline-none focus:border-omni-primary w-64"
          />

          {/* Filters button */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              'p-2 rounded-lg transition-colors relative',
              hasActiveFilters ? 'bg-omni-primary text-white' : 'bg-omni-bg border border-omni-border text-omni-text-secondary hover:text-omni-text'
            )}
            title="Filters"
          >
            <Filter className="w-4 h-4" />
            {hasActiveFilters && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-omni-accent text-white text-xs rounded-full flex items-center justify-center">
                {filters.states.length + filters.tags.length}
              </span>
            )}
          </button>

          {/* Sort button */}
          <div className="relative">
            <button
              onClick={() => setShowSortMenu(!showSortMenu)}
              className="p-2 rounded-lg bg-omni-bg border border-omni-border text-omni-text-secondary hover:text-omni-text transition-colors"
              title="Sort"
            >
              {sortOrder === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
            </button>

            {showSortMenu && (
              <div className="absolute top-full left-0 mt-2 bg-omni-bg-secondary border border-omni-border rounded-lg shadow-xl py-2 z-10 min-w-[200px]">
                {[
                  { field: 'updatedAt' as SortField, label: 'Last Updated' },
                  { field: 'title' as SortField, label: 'Title' },
                  { field: 'progress' as SortField, label: 'Progress' },
                  { field: 'state' as SortField, label: 'State' },
                ].map(({ field, label }) => (
                  <button
                    key={field}
                    onClick={() => {
                      toggleSort(field)
                      setShowSortMenu(false)
                    }}
                    className="w-full px-4 py-2 text-left hover:bg-omni-bg-tertiary transition-colors flex items-center justify-between"
                  >
                    <span className="text-sm text-omni-text">{label}</span>
                    {sortField === field && (
                      <Check className="w-4 h-4 text-omni-primary" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="text-sm text-omni-text-secondary">
          {filteredAndSortedNodes.length} {filteredAndSortedNodes.length === 1 ? 'task' : 'tasks'}
          {hasActiveFilters && ` of ${nodes.length} total`}
        </div>
      </div>

      {/* Filters panel */}
      {showFilters && (
        <div className="p-4 border-b border-omni-border bg-omni-bg-secondary/30">
          <div className="space-y-4">
            {/* State filter */}
            <div>
              <label className="text-sm font-medium text-omni-text mb-2 block">State</label>
              <div className="flex flex-wrap gap-2">
                {['not-started', 'in-progress', 'stopped', 'finished-success', 'finished-failure'].map(state => (
                  <button
                    key={state}
                    onClick={() => {
                      const newStates = filters.states.includes(state)
                        ? filters.states.filter(s => s !== state)
                        : [...filters.states, state]
                      setFilters({ ...filters, states: newStates })
                    }}
                    className={cn(
                      'px-3 py-1 rounded-full text-sm transition-colors',
                      filters.states.includes(state)
                        ? 'bg-omni-primary text-white'
                        : 'bg-omni-bg border border-omni-border text-omni-text-secondary hover:border-omni-text-tertiary'
                    )}
                  >
                    {state.replace('-', ' ')}
                  </button>
                ))}
              </div>
            </div>

            {/* Tag filter */}
            {allTags.length > 0 && (
              <div>
                <label className="text-sm font-medium text-omni-text mb-2 block">Tags</label>
                <div className="flex flex-wrap gap-2">
                  {allTags.slice(0, 10).map(tag => (
                    <button
                      key={tag}
                      onClick={() => {
                        const newTags = filters.tags.includes(tag)
                          ? filters.tags.filter(t => t !== tag)
                          : [...filters.tags, tag]
                        setFilters({ ...filters, tags: newTags })
                      }}
                      className={cn(
                        'px-2 py-1 rounded text-sm transition-colors',
                        filters.tags.includes(tag)
                          ? 'bg-omni-accent text-white'
                          : 'bg-omni-bg border border-omni-border text-omni-text-secondary hover:border-omni-text-tertiary'
                      )}
                    >
                      {tag}
                    </button>
                  ))}
                  {allTags.length > 10 && (
                    <span className="text-sm text-omni-text-tertiary">
                      +{allTags.length - 10} more
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Progress filter */}
            <div>
              <label className="text-sm font-medium text-omni-text mb-2 block">
                Progress: {filters.progressMin}% - {filters.progressMax}%
              </label>
              <div className="flex gap-4 items-center">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={filters.progressMin}
                  onChange={(e) => setFilters({ ...filters, progressMin: parseInt(e.target.value) })}
                  className="flex-1"
                />
                <span className="text-sm text-omni-text-secondary w-12 text-right">{filters.progressMin}%</span>
              </div>
              <div className="flex gap-4 items-center mt-2">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={filters.progressMax}
                  onChange={(e) => setFilters({ ...filters, progressMax: parseInt(e.target.value) })}
                  className="flex-1"
                />
                <span className="text-sm text-omni-text-secondary w-12 text-right">{filters.progressMax}%</span>
              </div>
            </div>

            {/* Clear filters */}
            {hasActiveFilters && (
              <button
                onClick={() => setFilters({
                  states: [],
                  tags: [],
                  progressMin: 0,
                  progressMax: 100,
                  searchQuery: ''
                })}
                className="text-sm text-omni-primary hover:text-omni-primary-hover transition-colors"
              >
                Clear all filters
              </button>
            )}
          </div>
        </div>
      )}

      {/* Bulk actions */}
      {selectedIds.size > 0 && (
        <div className="px-4 py-2 bg-omni-primary/10 border-b border-omni-primary/30 flex items-center justify-between">
          <span className="text-sm text-omni-text">
            {selectedIds.size} {selectedIds.size === 1 ? 'task' : 'tasks'} selected
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => {
                // TODO: Bulk state change
              }}
              className="px-3 py-1 bg-omni-primary text-white rounded text-sm hover:bg-omni-primary-hover transition-colors"
            >
              Change State
            </button>
            <button
              onClick={() => {
                // TODO: Bulk delete
              }}
              className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 transition-colors"
            >
              Delete
            </button>
            <button
              onClick={() => setSelectedIds(new Set())}
              className="px-3 py-1 bg-omni-bg border border-omni-border rounded text-sm hover:border-omni-text-tertiary transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Task list */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-4">
        {layout === 'list' ? (
          <div className="space-y-2">
            {/* Select all checkbox */}
            <div className="flex items-center gap-3 p-2 bg-omni-bg-secondary rounded-lg border border-omni-border">
              <input
                type="checkbox"
                checked={selectedIds.size === filteredAndSortedNodes.length && filteredAndSortedNodes.length > 0}
                onChange={toggleSelectAll}
                className="w-4 h-4 rounded border-omni-border"
              />
              <span className="text-sm text-omni-text-secondary">Select all</span>
            </div>

            {/* List items */}
            {filteredAndSortedNodes.map(node => (
              <div
                key={node.id}
                className={cn(
                  'flex items-center gap-3 p-3 rounded-lg border transition-all cursor-pointer',
                  selectedIds.has(node.id) ? 'bg-omni-primary/20 border-omni-primary' : 'bg-omni-bg-secondary border-omni-border hover:border-omni-border-hover',
                  selectedNodeId === node.id && 'ring-2 ring-omni-primary'
                )}
                onClick={(e) => {
                  if (!(e.target as HTMLElement).closest('input')) {
                    onNodeClick(node.id)
                  }
                }}
              >
                <input
                  type="checkbox"
                  checked={selectedIds.has(node.id)}
                  onChange={(e) => {
                    e.stopPropagation()
                    toggleSelect(node.id)
                  }}
                  className="w-4 h-4 rounded border-omni-border flex-shrink-0"
                />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {node.state && <TaskStateBadge state={node.state} size="sm" showLabel={false} />}
                    <h4 className="font-medium text-omni-text truncate">{node.title || 'Untitled'}</h4>
                  </div>
                  {node.content && (
                    <p className="text-sm text-omni-text-secondary line-clamp-1">{node.content}</p>
                  )}
                </div>

                <div className="flex items-center gap-3 flex-shrink-0">
                  {node.progressTarget && (
                    <div className="w-24">
                      <ProgressBar
                        current={node.progressCurrent}
                        target={node.progressTarget}
                        size="sm"
                        showPercentage={false}
                      />
                    </div>
                  )}

                  {node.tags.length > 0 && (
                    <div className="flex gap-1">
                      {node.tags.slice(0, 2).map(tag => (
                        <TagBadge key={tag} tag={tag} size="sm" />
                      ))}
                      {node.tags.length > 2 && (
                        <span className="text-xs text-omni-text-tertiary">+{node.tags.length - 2}</span>
                      )}
                    </div>
                  )}

                  {node.references.length > 0 && (
                    <ReferenceIndicator count={node.references.length} size="sm" />
                  )}

                  <span className="text-xs text-omni-text-tertiary w-20 text-right">
                    {new Date(node.updatedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          // Grid view
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredAndSortedNodes.map(node => (
              <div
                key={node.id}
                className={cn(
                  'glass p-4 rounded-lg border transition-all cursor-pointer',
                  selectedIds.has(node.id) ? 'bg-omni-primary/20 border-omni-primary' : 'border-omni-border hover:border-omni-border-hover',
                  selectedNodeId === node.id && 'ring-2 ring-omni-primary'
                )}
                onClick={() => onNodeClick(node.id)}
              >
                <div className="flex items-start justify-between mb-2">
                  <input
                    type="checkbox"
                    checked={selectedIds.has(node.id)}
                    onChange={(e) => {
                      e.stopPropagation()
                      toggleSelect(node.id)
                    }}
                    className="w-4 h-4 rounded border-omni-border flex-shrink-0"
                  />
                  {node.state && <TaskStateBadge state={node.state} size="sm" />}
                </div>

                <h4 className="font-medium text-omni-text mb-2 line-clamp-2">{node.title || 'Untitled'}</h4>

                {node.content && (
                  <p className="text-sm text-omni-text-secondary line-clamp-3 mb-3">{node.content}</p>
                )}

                <div className="space-y-2">
                  {node.progressTarget && (
                    <ProgressBar
                      current={node.progressCurrent}
                      target={node.progressTarget}
                      size="sm"
                      showPercentage={false}
                    />
                  )}

                  {node.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {node.tags.slice(0, 3).map(tag => (
                        <TagBadge key={tag} tag={tag} size="sm" />
                      ))}
                      {node.tags.length > 3 && (
                        <span className="text-xs text-omni-text-tertiary">+{node.tags.length - 3}</span>
                      )}
                    </div>
                  )}

                  <div className="flex items-center justify-between text-xs text-omni-text-tertiary">
                    {node.references.length > 0 && (
                      <ReferenceIndicator count={node.references.length} size="sm" />
                    )}
                    <span>{new Date(node.updatedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {filteredAndSortedNodes.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 rounded-full bg-omni-bg-secondary flex items-center justify-center mb-4">
              <Filter className="w-8 h-8 text-omni-text-tertiary" />
            </div>
            <h3 className="text-lg font-medium text-omni-text mb-2">No tasks found</h3>
            <p className="text-omni-text-secondary mb-4">
              {hasActiveFilters
                ? 'Try adjusting your filters'
                : 'Create your first task to get started'}
            </p>
            {hasActiveFilters && (
              <button
                onClick={() => setFilters({
                  states: [],
                  tags: [],
                  progressMin: 0,
                  progressMax: 100,
                  searchQuery: ''
                })}
                className="px-4 py-2 bg-omni-primary text-white rounded-lg hover:bg-omni-primary-hover transition-colors"
              >
                Clear Filters
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
