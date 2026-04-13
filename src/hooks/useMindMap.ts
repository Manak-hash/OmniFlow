import { useEffect, useState, useRef } from 'react'
import { toast } from 'sonner'
import * as simpleStore from '@/store/simple'
import type { Node } from '@/types/node'
import type { MindMap } from '@/types/mindmap'
import { createNode } from '@/types/node'
import { createMindMap } from '@/types/mindmap'

export function useMindMap(mindmapId: string | null) {
  const [mindmap, setMindmap] = useState<MindMap | null>(null)
  const [nodes, setNodes] = useState<Node[]>([])
  const [loading, setLoading] = useState(true)

  const isLoading = useRef(false)

  // Load initial data
  useEffect(() => {
    // Prevent concurrent loads
    if (isLoading.current) {
      return
    }

    isLoading.current = true
    let mounted = true

    async function load() {
      setLoading(true)
      try {
        if (mindmapId) {
          const [mindmapData, allNodes] = await Promise.all([
            simpleStore.getMindMap(mindmapId),
            simpleStore.getAllNodes()
          ])
          if (!mounted) return
          setMindmap(mindmapData || null)
          setNodes(allNodes)
        } else {
          // Check if mindmaps already exist, if so load the first one
          const existingMindmaps = await simpleStore.getAllMindMaps()

          if (existingMindmaps.length > 0 && mounted) {
            // Use the first existing mindmap
            const firstMindmap = existingMindmaps[0]
            const allNodes = await simpleStore.getAllNodes()
            setMindmap(firstMindmap)
            setNodes(allNodes)
          } else if (mounted) {
            // Create root node first
            const rootNode = createNode({
              title: 'Root',
              parentId: null
            })
            await simpleStore.createNode(rootNode)

            // Create mindmap with the root node's ID
            const newMindmap = createMindMap({
              name: 'My First MindMap',
              rootNodeId: rootNode.id
            })
            await simpleStore.createMindMap(newMindmap)
            setMindmap(newMindmap)
            setNodes([rootNode])
          }
        }
      } catch (error) {
        console.error('[useMindMap] Failed to load mindmap:', error)
        toast.error('Failed to load mindmap')
      } finally {
        if (mounted) {
          setLoading(false)
        }
        // Reset loading flag
        isLoading.current = false
      }
    }

    load()

    return () => {
      mounted = false
      isLoading.current = false
    }
  }, [mindmapId])

  // Note: Replicache subscription disabled to prevent infinite loops
  // Data will refresh on explicit actions (create, update, delete)
  // TODO: Implement proper Replicache subscription pattern

  // CRUD operations
  const createChildNode = async (parentId: string) => {
    if (!parentId) {
      toast.error('Cannot create node without a parent')
      return
    }

    try {
      const newNode = createNode({
        title: 'New Node',
        parentId
      })

      await simpleStore.createNode(newNode)

      // Refresh data after mutation
      const updatedNodes = await simpleStore.getAllNodes()
      setNodes(updatedNodes)

      toast.success('Node created successfully')
    } catch (error) {
      console.error('[useMindMap] Failed to create node:', error)
      toast.error('Failed to create node')
    }
  }

  const updateNode = async (id: string, changes: Partial<Node>) => {
    try {
      await simpleStore.updateNode({ id, changes })
      const updatedNodes = await simpleStore.getAllNodes()
      setNodes(updatedNodes)
      toast.success('Node updated')
    } catch (error) {
      console.error('[useMindMap] Failed to update node:', error)
      toast.error('Failed to update node')
    }
  }

  const deleteNode = async (id: string) => {
    try {
      await simpleStore.deleteNode(id)
      const updatedNodes = await simpleStore.getAllNodes()
      setNodes(updatedNodes)
      toast.success('Node deleted')
    } catch (error) {
      console.error('[useMindMap] Failed to delete node:', error)
      toast.error('Failed to delete node')
    }
  }

  return {
    mindmap,
    nodes,
    loading,
    createChildNode,
    updateNode,
    deleteNode
  }
}
