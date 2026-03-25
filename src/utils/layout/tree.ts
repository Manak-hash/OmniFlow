import type { Node } from '@/types/node'

export interface TreeNode {
  id: string
  parentId: string | null
  children: TreeNode[]
  depth: number
}

export function buildTree(nodes: Node[]): TreeNode[] {
  const nodeMap = new Map<string, TreeNode>()
  const rootNodes: TreeNode[] = []

  // Create tree nodes
  nodes.forEach(node => {
    nodeMap.set(node.id, {
      id: node.id,
      parentId: node.parentId,
      children: [],
      depth: 0
    })
  })

  // Build hierarchy
  nodes.forEach(node => {
    const treeNode = nodeMap.get(node.id)!
    if (node.parentId && nodeMap.has(node.parentId)) {
      const parent = nodeMap.get(node.parentId)!
      parent.children.push(treeNode)
      treeNode.depth = parent.depth + 1
    } else {
      rootNodes.push(treeNode)
    }
  })

  return rootNodes
}

export function calculateTreeLayout(nodes: Node[]): Map<string, { x: number; y: number }> {
  const tree = buildTree(nodes)
  const positions = new Map<string, { x: number; y: number }>()
  const NODE_WIDTH = 200
  const NODE_HEIGHT = 80
  const HORIZONTAL_SPACING = 50
  const VERTICAL_SPACING = 100

  // Track y-position for each depth level
  const depthCounters = new Map<number, number>()

  function traverse(treeNodes: TreeNode[], depth: number = 0) {
    treeNodes.forEach(treeNode => {
      // Get or initialize counter for this depth
      const counter = depthCounters.get(depth) || 0
      depthCounters.set(depth, counter + 1)

      positions.set(treeNode.id, {
        x: depth * (NODE_WIDTH + HORIZONTAL_SPACING),
        y: counter * (NODE_HEIGHT + VERTICAL_SPACING)
      })

      traverse(treeNode.children, depth + 1)
    })
  }

  traverse(tree)
  return positions
}
