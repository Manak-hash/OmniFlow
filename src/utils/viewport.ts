import type { Node } from '@/types/node'

export interface ViewportBounds {
  minX: number
  maxX: number
  minY: number
  maxY: number
  width: number
  height: number
}

/**
 * Calculate viewport bounds from node positions
 */
export function calculateViewportBounds(
  nodes: Node[],
  positions: Map<string, { x: number; y: number }>
): ViewportBounds {
  if (nodes.length === 0 || positions.size === 0) {
    return { minX: 0, maxX: 800, minY: 0, maxY: 600, width: 800, height: 600 }
  }

  const xValues: number[] = []
  const yValues: number[] = []

  nodes.forEach(node => {
    const pos = positions.get(node.id)
    if (pos) {
      xValues.push(pos.x)
      yValues.push(pos.y)
    }
  })

  if (xValues.length === 0) {
    return { minX: 0, maxX: 800, minY: 0, maxY: 600, width: 800, height: 600 }
  }

  const minX = Math.min(...xValues)
  const maxX = Math.max(...xValues)
  const minY = Math.min(...yValues)
  const maxY = Math.max(...yValues)

  // Add padding
  const padding = 100
  return {
    minX: minX - padding,
    maxX: maxX + padding,
    minY: minY - padding,
    maxY: maxY + padding,
    width: maxX - minX + padding * 2,
    height: maxY - minY + padding * 2
  }
}

/**
 * Convert screen coordinates to viewport coordinates
 */
export function screenToViewport(
  screenX: number,
  screenY: number,
  bounds: ViewportBounds,
  viewportWidth: number,
  viewportHeight: number
): { x: number; y: number } {
  const scaleX = bounds.width / viewportWidth
  const scaleY = bounds.height / viewportHeight

  return {
    x: bounds.minX + screenX * scaleX,
    y: bounds.minY + screenY * scaleY
  }
}

/**
 * Convert viewport coordinates to screen coordinates
 */
export function viewportToScreen(
  viewportX: number,
  viewportY: number,
  bounds: ViewportBounds,
  viewportWidth: number,
  viewportHeight: number
): { x: number; y: number } {
  const scaleX = viewportWidth / bounds.width
  const scaleY = viewportHeight / bounds.height

  return {
    x: (viewportX - bounds.minX) * scaleX,
    y: (viewportY - bounds.minY) * scaleY
  }
}
