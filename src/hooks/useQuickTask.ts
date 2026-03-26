import { useState, useCallback } from 'react'
import type { TaskState } from '@/types/node'
import { useMindMap } from './useMindMap'
import { useUIStore } from '@/store/ui'
import { toast } from 'sonner'

export function useQuickTask() {
  const { createChildNode } = useMindMap(null)
  const { selectedNodeId } = useUIStore()
  const [isQuickModalOpen, setIsQuickModalOpen] = useState(false)

  const openQuickTaskModal = useCallback(() => {
    setIsQuickModalOpen(true)
  }, [])

  const closeQuickTaskModal = useCallback(() => {
    setIsQuickModalOpen(false)
  }, [])

  const createQuickTask = useCallback(async (data: {
    title: string
    content: string
    state: TaskState | null
    tags: string[]
    parentId: string | null
  }) => {
    // Use selected parent or create without parent (root)
    const parentId = data.parentId || selectedNodeId || null

    if (parentId) {
      await createChildNode(parentId)
      toast.success('Task created successfully')
    } else {
      // Create as root node - show error or handle differently
      toast.error('Please select a parent node first')
    }
  }, [createChildNode, selectedNodeId])

  return {
    isQuickModalOpen,
    openQuickTaskModal,
    closeQuickTaskModal,
    createQuickTask,
  }
}
