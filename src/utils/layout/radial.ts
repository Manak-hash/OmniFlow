import { tree } from 'd3-hierarchy'
import type { HierarchyNode } from 'd3-hierarchy'
import type { Node } from '@/types/node'

interface RadialTreeNode {
  id: string
  node: Node
  children: RadialTreeNode[]
}

/**
 * Calculate radial (circular) layout positions
 */
export function calculateRadialLayout(
  nodes: Node[],
  options: {
    width?: number
    height?: number
    radius?: number
  } = {}
): Map<string, { x: number; y: number }> {
  const {
    width = 800,
    height = 600,
    radius = Math.min(width, height) / 2 - 50
  } = options

  if (nodes.length === 0) {
    return new Map()
  }

  // Find root node (no parent)
  const rootNode = nodes.find(n => n.parentId === null)
  if (!rootNode) {
    // Fallback: use first node as root
    return calculateRadialLayoutWithRoot(nodes[0], nodes, width, height, radius)
  }

  return calculateRadialLayoutWithRoot(rootNode, nodes, width, height, radius)
}

/**
 * Calculate radial layout with specified root
 */
function calculateRadialLayoutWithRoot(
  root: Node,
  allNodes: Node[],
  width: number,
  height: number,
  radius: number
): Map<string, { x: number; y: number }> {
  // Build tree structure
  const treeData = buildRadialTree(root, allNodes)

  // Create hierarchy
  const hierarchy = createHierarchy(treeData) as HierarchyNode<unknown>

  // Apply tree layout
  const treeLayout = tree().size([2 * Math.PI, radius])

  const rootLayout = treeLayout(hierarchy)

  // Extract positions
  const positions = new Map<string, { x: number; y: number }>()
  const centerX = width / 2
  const centerY = height / 2

  rootLayout.each((node: any) => {
    const x = centerX + node.x * Math.cos(node.y)
    const y = centerY + node.x * Math.sin(node.y)
    positions.set(node.data.id, {
      x: Math.round(x),
      y: Math.round(y)
    })
  })

  return positions
}

/**
 * Build radial tree structure
 */
function buildRadialTree(root: Node, allNodes: Node[]): RadialTreeNode {
  const nodeMap = new Map<string, RadialTreeNode>()

  // First pass: create all nodes
  allNodes.forEach(node => {
    nodeMap.set(node.id, {
      id: node.id,
      node,
      children: []
    })
  })

  // Second pass: build hierarchy
  allNodes.forEach(node => {
    const treeNode = nodeMap.get(node.id)!
    if (node.parentId && nodeMap.has(node.parentId)) {
      const parent = nodeMap.get(node.parentId)!
      parent.children.push(treeNode)
    }
  })

  return nodeMap.get(root.id)!
}

/**
 * Create d3 hierarchy from radial tree
 */
function createHierarchy(treeNode: RadialTreeNode): HierarchyNode<RadialTreeNode> {
  return {
    ...treeNode,
    depth: 0,
    height: 0,
    parent: null,
    children: treeNode.children.length > 0 ? treeNode.children.map(createHierarchy) : undefined,
    data: treeNode,
    each: function(callback: (node: HierarchyNode<RadialTreeNode>, index: number) => void) {
      const queue: HierarchyNode<RadialTreeNode>[] = [this as any]
      while (queue.length > 0) {
        const node = queue.shift()!
        callback(node, 0)
        if (node.children) {
          queue.push(...node.children as HierarchyNode<RadialTreeNode>[])
        }
      }
      return this
    },
    eachAfter: function(callback: (node: HierarchyNode<RadialTreeNode>, index: number) => void) {
      const nodes: HierarchyNode<RadialTreeNode>[] = []
      this.each((node: HierarchyNode<RadialTreeNode>) => nodes.push(node))
      for (let i = nodes.length - 1; i >= 0; i--) {
        callback(nodes[i], i)
      }
      return this
    },
    eachBefore: function(callback: (node: HierarchyNode<RadialTreeNode>) => void) {
      this.each((node: HierarchyNode<RadialTreeNode>) => callback(node))
      return this
    },
    sum: function() { return this },
    count: function() {
      let count = 0
      this.each(() => count++)
      this.count = () => count as any
      return this as any
    },
    sort: function() { return this },
    ancestors: function() { return [] },
    descendants: function() { return [] },
    leaves: function() { return [] },
    path: function() { return [] },
    links: function() { return [] },
    copy: function() { return this }
  } as any
}

/**
 * Calculate radial layout with adaptive radius
 */
export function calculateAdaptiveRadialLayout(
  nodes: Node[],
  width: number,
  height: number
): Map<string, { x: number; y: number }> {
  // Calculate max depth to determine optimal radius
  const maxDepth = calculateMaxDepth(nodes)
  const optimalRadius = Math.min(width, height) / 2 - Math.max(50, maxDepth * 20)

  return calculateRadialLayout(nodes, {
    width,
    height,
    radius: optimalRadius
  })
}

/**
 * Calculate maximum depth of tree
 */
function calculateMaxDepth(nodes: Node[]): number {
  const depths = new Map<string, number>()

  function getDepth(nodeId: string): number {
    if (depths.has(nodeId)) {
      return depths.get(nodeId)!
    }

    const node = nodes.find(n => n.id === nodeId)
    if (!node || !node.parentId) {
      depths.set(nodeId, 0)
      return 0
    }

    const depth = getDepth(node.parentId) + 1
    depths.set(nodeId, depth)
    return depth
  }

  let maxDepth = 0
  nodes.forEach(node => {
    maxDepth = Math.max(maxDepth, getDepth(node.id))
  })

  return maxDepth
}
