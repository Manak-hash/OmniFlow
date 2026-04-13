import { useEffect, useRef } from 'react'

interface Ripple {
  id: number
  radius: number
  opacity: number
  speed: number
}

interface SpaceTimeRipplesProps {
  canvas: HTMLCanvasElement | null
  progress: number
  color: string
}

/**
 * Space-time ripples effect
 * Concentric circles expanding from the wormhole center
 */
export function useSpaceTimeRipples({ canvas, progress, color }: SpaceTimeRipplesProps) {
  const ripplesRef = useRef<Ripple[]>([])
  const animationRef = useRef<number | undefined>(undefined)
  const lastAddTimeRef = useRef(0)

  useEffect(() => {
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const centerX = canvas.width / 2
    const centerY = canvas.height / 2
    const maxRadius = Math.max(canvas.width, canvas.height)

    const animate = (timestamp: number) => {
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Add new ripple periodically
      if (timestamp - lastAddTimeRef.current > 400) {
        // Increase frequency as progress increases
        const frequency = 400 - progress * 300 // 400ms down to 100ms
        if (timestamp - lastAddTimeRef.current > frequency) {
          ripplesRef.current.push({
            id: timestamp,
            radius: 0,
            opacity: 1,
            speed: 2 + progress * 3, // Speed increases with progress
          })
          lastAddTimeRef.current = timestamp
        }
      }

      // Update and draw ripples
      ripplesRef.current = ripplesRef.current.filter((ripple) => {
        ripple.radius += ripple.speed
        ripple.opacity = 1 - (ripple.radius / maxRadius)

        if (ripple.opacity <= 0) return false

        // Draw ripple
        ctx.beginPath()
        ctx.arc(centerX, centerY, ripple.radius, 0, Math.PI * 2)
        ctx.strokeStyle = color.replace(')', `, ${ripple.opacity * 0.3})`).replace('rgb', 'rgba')
        ctx.lineWidth = 2 + progress * 2
        ctx.stroke()

        // Add glow effect
        ctx.shadowBlur = 10
        ctx.shadowColor = color
        ctx.stroke()
        ctx.shadowBlur = 0

        return true
      })

      animationRef.current = requestAnimationFrame(animate)
    }

    animationRef.current = requestAnimationFrame(animate)

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
      ripplesRef.current = []
    }
  }, [canvas, progress, color])

  return { ripples: ripplesRef.current }
}
