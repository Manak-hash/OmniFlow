import { useState } from 'react'
import { Search, Filter, X, List, Grid3x3, LayoutGrid, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useKanbanStore } from '@/store/kanban'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel
} from '@/components/ui/DropdownMenu'
import { extractAllTags, extractAllAssignees } from '@/utils/kanban'
import type { Node } from '@/types/node'

interface FilterBarProps {
  nodes: Node[]
  onToggleBulkMode: () => void
  isBulkMode: boolean
  selectedCount: number
}

export function FilterBar({ nodes, onToggleBulkMode, isBulkMode, selectedCount }: FilterBarProps) {
  const {
    filters,
    setSearchQuery,
    toggleTagFilter,
    togglePriorityFilter,
    toggleAssigneeFilter,
    toggleOverdueFilter,
    clearAllFilters,
    compactMode,
    setCompactMode,
    setColorBy,
    swimlaneBy,
    setSwimlaneBy
  } = useKanbanStore()

  const [searchInput, setSearchInput] = useState(filters.searchQuery)

  const allTags = extractAllTags(nodes)
  const allAssignees = extractAllAssignees(nodes)
  const priorities = ['critical', 'high', 'medium', 'low']

  const handleSearchChange = (value: string) => {
    setSearchInput(value)
    setSearchQuery(value)
  }

  const hasActiveFilters =
    filters.searchQuery ||
    filters.selectedTags.length > 0 ||
    filters.selectedPriorities.length > 0 ||
    filters.selectedAssignees.length > 0 ||
    filters.overdueOnly

  const activeFilterCount =
    (filters.searchQuery ? 1 : 0) +
    filters.selectedTags.length +
    filters.selectedPriorities.length +
    filters.selectedAssignees.length +
    (filters.overdueOnly ? 1 : 0)

  return (
    <div className="flex items-center gap-3 px-4 py-3 border-b border-omni-border bg-omni-bg-secondary">
      {/* Search */}
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-omni-text-tertiary" />
        <input
          type="text"
          placeholder="Search tasks..."
          value={searchInput}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-omni-bg-tertiary rounded-lg border border-omni-border focus:border-omni-primary outline-none text-sm"
        />
        {searchInput && (
          <button
            onClick={() => handleSearchChange('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-omni-text-tertiary hover:text-omni-text"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Filter chip */}
      {hasActiveFilters && (
        <div className="flex items-center gap-2 px-3 py-1.5 bg-omni-primary/20 rounded-lg">
          <Filter className="w-4 h-4 text-omni-primary" />
          <span className="text-sm font-medium text-omni-primary">{activeFilterCount}</span>
          <button
            onClick={clearAllFilters}
            className="text-omni-primary hover:text-omni-primary-hover"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Tag filters */}
      {filters.selectedTags.length > 0 && (
        <div className="flex gap-1">
          {filters.selectedTags.map(tag => (
            <button
              key={tag}
              onClick={() => toggleTagFilter(tag)}
              className="px-2 py-1 bg-omni-bg-tertiary rounded text-xs flex items-center gap-1 hover:bg-omni-bg-tertiary/80"
            >
              #{tag} <X className="w-3 h-3" />
            </button>
          ))}
        </div>
      )}

      {/* Priority filters */}
      {filters.selectedPriorities.length > 0 && (
        <div className="flex gap-1">
          {filters.selectedPriorities.map(priority => (
            <button
              key={priority}
              onClick={() => togglePriorityFilter(priority)}
              className="px-2 py-1 bg-omni-bg-tertiary rounded text-xs flex items-center gap-1 hover:bg-omni-bg-tertiary/80 capitalize"
            >
              {priority} <X className="w-3 h-3" />
            </button>
          ))}
        </div>
      )}

      {/* Filter dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="gap-2">
            <Filter className="w-4 h-4" />
            Filters
            {hasActiveFilters && (
              <span className="px-1.5 py-0.5 bg-omni-primary rounded text-xs">
                {activeFilterCount}
              </span>
            )}
            <ChevronDown className="w-3 h-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>Filter by</DropdownMenuLabel>
          <DropdownMenuSeparator />

          {/* Overdue filter */}
          <DropdownMenuCheckboxItem
            checked={filters.overdueOnly}
            onCheckedChange={toggleOverdueFilter}
          >
            Overdue only
          </DropdownMenuCheckboxItem>

          <DropdownMenuSeparator />
          <DropdownMenuLabel>Priority</DropdownMenuLabel>
          {priorities.map(priority => (
            <DropdownMenuCheckboxItem
              key={priority}
              checked={filters.selectedPriorities.includes(priority)}
              onCheckedChange={() => togglePriorityFilter(priority)}
            >
              <span className="capitalize">{priority}</span>
            </DropdownMenuCheckboxItem>
          ))}

          {allTags.length > 0 && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Tags</DropdownMenuLabel>
              {allTags.slice(0, 10).map(tag => (
                <DropdownMenuCheckboxItem
                  key={tag}
                  checked={filters.selectedTags.includes(tag)}
                  onCheckedChange={() => toggleTagFilter(tag)}
                >
                  #{tag}
                </DropdownMenuCheckboxItem>
              ))}
            </>
          )}

          {allAssignees.length > 0 && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Assignees</DropdownMenuLabel>
              {allAssignees.slice(0, 5).map(assignee => (
                <DropdownMenuCheckboxItem
                  key={assignee}
                  checked={filters.selectedAssignees.includes(assignee)}
                  onCheckedChange={() => toggleAssigneeFilter(assignee)}
                >
                  {assignee}
                </DropdownMenuCheckboxItem>
              ))}
            </>
          )}

          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={clearAllFilters}>
            Clear all filters
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Swimlane dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="gap-2">
            <LayoutGrid className="w-4 h-4" />
            Group
            {swimlaneBy && (
              <span className="px-1.5 py-0.5 bg-omni-primary rounded text-xs capitalize">
                {swimlaneBy}
              </span>
            )}
            <ChevronDown className="w-3 h-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setSwimlaneBy(null)}>
            No grouping
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setSwimlaneBy('tag')}>
            Group by tag
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setSwimlaneBy('priority')}>
            Group by priority
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setSwimlaneBy('assignee')}>
            Group by assignee
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setSwimlaneBy('dueDate')}>
            Group by due date
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* View mode toggle */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="gap-2">
            {compactMode ? <List className="w-4 h-4" /> : <Grid3x3 className="w-4 h-4" />}
            View
            <ChevronDown className="w-3 h-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setCompactMode(false)}>
            <Grid3x3 className="w-4 h-4 mr-2" />
            Detailed
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setCompactMode(true)}>
            <List className="w-4 h-4 mr-2" />
            Compact
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuLabel>Color by</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => setColorBy(null)}>
            None
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setColorBy('priority')}>
            Priority
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setColorBy('tag')}>
            Tag
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Bulk mode toggle */}
      <Button
        variant={isBulkMode ? 'primary' : 'ghost'}
        size="sm"
        onClick={onToggleBulkMode}
        className="gap-2"
      >
        <input
          type="checkbox"
          checked={isBulkMode}
          onChange={() => {}}
          className="pointer-events-none"
        />
        {isBulkMode && <span className="text-xs">{selectedCount} selected</span>}
      </Button>
    </div>
  )
}
