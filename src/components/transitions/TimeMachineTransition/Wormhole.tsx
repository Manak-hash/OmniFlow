import { useEffect, useRef } from 'react'
import type { WormholeLayer } from './types'

interface WormholeProps {
  canvas: HTMLCanvasElement | null
  progress: number
  themeColors: { primary: string; accent: string; bg: string }
}

/**
 * Wormhole visualization
 * Spiraling vortex of rainbow light that intensifies over time
 */
export function useWormhole({ canvas, progress, themeColors }: WormholeProps) {
  const animationRef = useRef<number | undefined>(undefined)
  const layersRef = useRef<WormholeLayer[]>([])
  const rotationRef = useRef(0)

  // Initialize wormhole layers
  useEffect(() => {
    if (!canvas) return

    // Create 10 layers of spiral arms
    const layers: WormholeLayer[] = []
    for (let i = 0; i < 10; i++) {
      layers.push({
        speed: 0.5 + i * 0.2,
        radius: 20 + i * 30,
        color: i % 2 === 0 ? themeColors.primary : themeColors.accent,
        opacity: 0.1 + i * 0.05,
      })
    }
    layersRef.current = layers
  }, [canvas, themeColors])

  // Animate wormhole
  useEffect(() => {
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const centerX = canvas.width / 2
    const centerY = canvas.height / 2

    const animate = () => {
      // Clear with fade effect for trails
      ctx.fillStyle = `${themeColors.bg}20`
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Update rotation
      rotationRef.current += 0.02

      // Draw each layer
      layersRef.current.forEach((layer, index) => {
        const numArms = 3 + index
        const intensity = Math.min(1, progress * 2) // Fade in over first half

        for (let i = 0; i < numArms; i++) {
          const angle = (i / numArms) * Math.PI * 2 + rotationRef.current * layer.speed
          const spiralRadius = layer.radius * (1 + progress * 2)

          const x = centerX + Math.cos(angle) * spiralRadius
          const y = centerY + Math.sin(angle) * spiralRadius

          // Draw spiral arm
          const gradient = ctx.createRadialGradient(x, y, 0, x, y, 50)
          gradient.addColorStop(0, layer.color)
          gradient.addColorStop(0.5, `${layer.color}40`)
          gradient.addColorStop(1, 'transparent')

          ctx.globalAlpha = layer.opacity * intensity
          ctx.fillStyle = gradient
          ctx.beginPath()
          ctx.arc(x, y, 30 + progress * 20, 0, Math.PI * 2)
          ctx.fill()
        }
      })

      // Draw center vortex
      const vortexGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 100)
      vortexGradient.addColorStop(0, '#ffffff80')
      vortexGradient.addColorStop(0.3, themeColors.primary + '60')
      vortexGradient.addColorStop(0.7, themeColors.accent + '40')
      vortexGradient.addColorStop(1, 'transparent')

      ctx.globalAlpha = 0.5 + progress * 0.5
      ctx.fillStyle = vortexGradient
      ctx.beginPath()
      ctx.arc(centerX, centerY, 100 * (1 + progress), 0, Math.PI * 2)
      ctx.fill()

      ctx.globalAlpha = 1

      animationRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [canvas, progress, themeColors])

  return { rotation: rotationRef.current }
}
