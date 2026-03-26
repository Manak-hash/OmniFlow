import { useState, useEffect, useRef } from 'react'
import { Input } from '@/components/ui/Input'
import { searchNodes } from '@/store/replicache/queries'
import { getReplicache } from '@/store/replicache'
import type { Node } from '@/types/node'
import { cn } from '@/utils/cn'

interface NodeSelectorProps {
  excludeId?: string
  onSelect: (nodeId: string) => void
  placeholder?: string
  className?: string
}

export function NodeSelector({
  excludeId,
  onSelect,
  placeholder = 'Search nodes...',
  className
}: NodeSelectorProps) {
  const [search, setSearch] = useState('')
  const [results, setResults] = useState<Node[]>([])
  const [loading, setLoading] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const replicache = getReplicache()

  // Search for nodes
  useEffect(() => {
    if (!search.trim()) {
      setResults([])
      return
    }

    const performSearch = async () => {
      setLoading(true)
      try {
        const allResults = await searchNodes(replicache, search)
        const filtered = excludeId
          ? allResults.filter(n => n.id !== excludeId)
          : allResults
        setResults(filtered.slice(0, 10)) // Limit to 10 results
      } catch (error) {
        console.error('Search failed:', error)
        setResults([])
      } finally {
        setLoading(false)
      }
    }

    const debounceTimer = setTimeout(performSearch, 300)
    return () => clearTimeout(debounceTimer)
  }, [search, excludeId, replicache])

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as HTMLElement)) {
        setShowResults(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelect = (nodeId: string) => {
    onSelect(nodeId)
    setSearch('')
    setResults([])
    setShowResults(false)
  }

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      <Input
        value={search}
        onChange={(e) => {
          setSearch(e.target.value)
          setShowResults(true)
        }}
        onFocus={() => setShowResults(true)}
        placeholder={placeholder}
      />

      {/* Search Results */}
      {showResults && (search.trim() || loading) && (
        <div className="absolute z-10 w-full mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {loading ? (
            <div className="px-3 py-2 text-gray-400 text-sm">Searching...</div>
          ) : results.length === 0 ? (
            <div className="px-3 py-2 text-gray-400 text-sm">No nodes found</div>
          ) : (
            results.map(node => (
              <button
                key={node.id}
                onClick={() => handleSelect(node.id)}
                className="w-full text-left px-3 py-2 hover:bg-gray-700 transition-colors border-b border-gray-700 last:border-b-0"
              >
                <div className="font-medium text-sm text-text truncate">
                  {node.title || 'Untitled'}
                </div>
                {node.content && (
                  <div className="text-xs text-gray-400 truncate">
                    {node.content}
                  </div>
                )}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  )
}
