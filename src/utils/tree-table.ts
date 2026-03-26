import type { Node } from '@/types/node'

export interface FlatNode {
  node: Node
  depth: number
  hasChildren: boolean
  isExpanded: boolean
  parentId: string | null
}

interface TreeNode {
  id: string
  node: Node
  children: TreeNode[]
  depth: number
}

/**
 * Build a tree structure from flat nodes
 */
function buildTreeStructure(nodes: Node[]): TreeNode[] {
  const nodeMap = new Map<string, TreeNode>()
  const rootNodes: TreeNode[] = []

  // First pass: create all tree nodes
  nodes.forEach(node => {
    nodeMap.set(node.id, {
      id: node.id,
      node,
      children: [],
      depth: 0
    })
  })

  // Second pass: build hierarchy
  nodes.forEach(node => {
    const treeNode = nodeMap.get(node.id)!
    if (node.parentId && nodeMap.has(node.parentId)) {
      const parent = nodeMap.get(node.parentId)!
      parent.children.push(treeNode)
    } else {
      rootNodes.push(treeNode)
    }
  })

  return rootNodes
}

/**
 * Flatten tree to array with depth information
 */
export function flattenTree(
  nodes: Node[],
  expandedIds: Set<string>
): FlatNode[] {
  const tree = buildTreeStructure(nodes)
  const flat: FlatNode[] = []

  function traverse(treeNodes: TreeNode[], depth: number, parentId: string | null) {
    treeNodes.forEach(({ node, children }) => {
      const isExpanded = expandedIds.has(node.id)
      flat.push({
        node,
        depth,
        hasChildren: children.length > 0,
        isExpanded,
        parentId
      })

      if (isExpanded && children.length > 0) {
        traverse(children, depth + 1, node.id)
      }
    })
  }

  traverse(tree, 0, null)
  return flat
}

/**
 * Get all descendants of a node
 */
export function getDescendants(nodes: Node[], nodeId: string): string[] {
  const descendants: string[] = []
  const children = nodes.filter(n => n.parentId === nodeId)

  children.forEach(child => {
    descendants.push(child.id)
    descendants.push(...getDescendants(nodes, child.id))
  })

  return descendants
}

/**
 * Get path from root to node
 */
export function getNodePath(nodes: Node[], nodeId: string): Node[] {
  const path: Node[] = []
  let current: Node | undefined = nodes.find(n => n.id === nodeId)

  while (current) {
    path.unshift(current)
    if (current.parentId) {
      const parentId = current.parentId
      current = nodes.find(n => n.id === parentId)
    } else {
      break
    }
  }

  return path
}
