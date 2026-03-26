import { useEffect, useState } from 'react'
import { getReplicache, queries } from '@/store/replicache'
import type { Node } from '@/types/node'
import type { MindMap } from '@/types/mindmap'
import { createNode } from '@/types/node'
import { createMindMap } from '@/types/mindmap'
import { extractAllTags } from '@/utils/tags'
import { useUIStore } from '@/store/ui'

export function useMindMap(mindmapId: string | null) {
  const [mindmap, setMindmap] = useState<MindMap | null>(null)
  const [nodes, setNodes] = useState<Node[]>([])
  const [loading, setLoading] = useState(true)
  const { setAllTags } = useUIStore()

  const replicache = getReplicache()

  // Load initial data
  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        if (mindmapId) {
          const [mindmapData, allNodes] = await Promise.all([
            queries.getMindMap(replicache, mindmapId),
            queries.getAllNodes(replicache)
          ])
          setMindmap(mindmapData || null)
          setNodes(allNodes)
          setAllTags(extractAllTags(allNodes))
        } else {
          // Create new mindmap
          const newMindmap = createMindMap({ name: 'My First MindMap' })
          await replicache.mutate.createMindMap(newMindmap)
          setMindmap(newMindmap)
          setNodes([])
          setAllTags([])

          // Create root node
          const rootNode = createNode({
            title: 'Root',
            parentId: null
          })
          await replicache.mutate.createNode(rootNode)
          setNodes([rootNode])
          setAllTags([])
        }
      } catch (error) {
        console.error('Failed to load mindmap:', error)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [mindmapId, replicache, setAllTags])

  // Subscribe to changes
  useEffect(() => {
    if (!mindmap) return

    // Note: Replicache subscribe API may vary - using simple polling for now
    const interval = setInterval(async () => {
      const updatedNodes = await queries.getAllNodes(replicache)
      setNodes(updatedNodes)
      setAllTags(extractAllTags(updatedNodes))
      const updatedMindmap = await queries.getMindMap(replicache, mindmap.id)
      setMindmap(updatedMindmap || null)
    }, 1000)

    return () => clearInterval(interval)
  }, [mindmap, replicache, setAllTags])

  // CRUD operations
  const createChildNode = async (parentId: string) => {
    const newNode = createNode({
      title: 'New Node',
      parentId
    })
    await replicache.mutate.createNode(newNode)
  }

  const updateNode = async (id: string, changes: Partial<Node>) => {
    await replicache.mutate.updateNode({ id, changes })
  }

  const deleteNode = async (id: string) => {
    await replicache.mutate.deleteNode(id)
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
