import { forceSimulation, forceLink, forceManyBody, forceCenter, forceCollide } from 'd3-force'
import type { Node } from '@/types/node'

interface SimNode extends Node {
  x: number
  y: number
  vx: number
  vy: number
  index?: number
}

interface SimLink {
  source: SimNode
  target: SimNode
  index?: number
}

/**
 * Calculate force-directed layout positions
 */
export function calculateForceLayout(
  nodes: Node[],
  options: {
    width?: number
    height?: number
    linkDistance?: number
    chargeStrength?: number
    collideRadius?: number
    iterations?: number
  } = {}
): Map<string, { x: number; y: number }> {
  const {
    width = 800,
    height = 600,
    linkDistance = 100,
    chargeStrength = -300,
    collideRadius = 50,
    iterations = 300
  } = options

  if (nodes.length === 0) {
    return new Map()
  }

  // Convert to simulation format
  const simNodes: SimNode[] = nodes.map(n => ({
    ...n,
    x: n.position?.x || Math.random() * width,
    y: n.position?.y || Math.random() * height,
    vx: 0,
    vy: 0
  }))

  const simLinks: SimLink[] = []
  const nodeMap = new Map(simNodes.map(n => [n.id, n]))

  // Create links from parent-child relationships
  nodes.forEach(node => {
    if (node.parentId && nodeMap.has(node.parentId)) {
      simLinks.push({
        source: nodeMap.get(node.parentId)!,
        target: nodeMap.get(node.id)!
      })
    }
  })

  // Run simulation
  const simulation = forceSimulation(simNodes)
    .force('link', forceLink(simLinks).distance(linkDistance))
    .force('charge', forceManyBody().strength(chargeStrength))
    .force('center', forceCenter(width / 2, height / 2))
    .force('collide', forceCollide().radius(collideRadius))

  // Run for specified iterations
  for (let i = 0; i < iterations; i++) {
    simulation.tick()
  }

  // Extract positions
  const positions = new Map<string, { x: number; y: number }>()
  simNodes.forEach(node => {
    positions.set(node.id, {
      x: Math.round(node.x),
      y: Math.round(node.y)
    })
  })

  return positions
}

/**
 * Calculate adaptive force-directed layout with auto-tuning parameters
 */
export function calculateAdaptiveForceLayout(
  nodes: Node[],
  width: number,
  height: number
): Map<string, { x: number; y: number }> {
  const nodeCount = nodes.length

  // Auto-tune parameters based on node count
  const options = {
    width,
    height,
    linkDistance: nodeCount < 20 ? 120 : nodeCount < 50 ? 100 : 80,
    chargeStrength: nodeCount < 20 ? -200 : nodeCount < 50 ? -300 : -400,
    collideRadius: nodeCount < 20 ? 40 : nodeCount < 50 ? 50 : 60,
    iterations: nodeCount < 20 ? 200 : nodeCount < 50 ? 300 : 400
  }

  return calculateForceLayout(nodes, options)
}
