import { useEffect, useRef } from 'react'
import type { LogoParticle } from './types'

interface ParticleSystemProps {
  canvas: HTMLCanvasElement | null
  phase: 'dissolve' | 'spiral' | 'reassemble' | 'complete'
  progress: number
}

/**
 * Particle system for logo transformation
 * Dissolves logo into particles → spirals into wormhole → reassembles
 */
export function useParticleSystem({ canvas, phase, progress }: ParticleSystemProps) {
  const particlesRef = useRef<LogoParticle[]>([])
  const animationRef = useRef<number | undefined>(undefined)
  const logoImageDataRef = useRef<ImageData | null>(null)
  const hasInitializedRef = useRef(false)

  // Extract logo particles from canvas
  useEffect(() => {
    if (!canvas || phase !== 'dissolve' || hasInitializedRef.current) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Draw OmniSwitcher logo to canvas
    const centerX = canvas.width / 2
    const centerY = canvas.height / 2

    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.fillStyle = '#ef4444' // omni-primary color
    ctx.font = 'bold 80px Outfit'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('Omni', centerX, centerY - 20)

    ctx.fillStyle = '#3b82f6' // accent color
    ctx.fillText('Flow', centerX, centerY + 60)

    // Get image data
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    logoImageDataRef.current = imageData

    // Create particles from non-transparent pixels
    const particles: LogoParticle[] = []
    const samplingRate = 4 // Sample every 4th pixel for performance

    for (let y = 0; y < canvas.height; y += samplingRate) {
      for (let x = 0; x < canvas.width; x += samplingRate) {
        const i = (y * canvas.width + x) * 4
        const alpha = imageData.data[i + 3]

        if (alpha > 128) {
          const r = imageData.data[i]
          const g = imageData.data[i + 1]
          const b = imageData.data[i + 2]
          const color = `rgb(${r},${g},${b})`

          particles.push({
            id: `${x}-${y}`,
            originX: x,
            originY: y,
            x,
            y,
            vx: (Math.random() - 0.5) * 2,
            vy: (Math.random() - 0.5) * 2,
            color,
            size: 2,
            alpha: 1,
            phase: 'idle',
          })
        }
      }
    }

    particlesRef.current = particles
    hasInitializedRef.current = true
  }, [canvas, phase])

  // Animate particles
  useEffect(() => {
    if (!canvas || particlesRef.current.length === 0) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const centerX = canvas.width / 2
    const centerY = canvas.height / 2

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      particlesRef.current.forEach((particle) => {
        // Update particle based on phase
        switch (phase) {
          case 'dissolve':
            // Scatter outward randomly
            particle.x += particle.vx * 2
            particle.y += particle.vy * 2
            particle.alpha = Math.max(0, 1 - progress * 2)
            break

          case 'spiral':
            // Spiral toward center (wormhole)
            const dx = centerX - particle.x
            const dy = centerY - particle.y
            const angle = Math.atan2(dy, dx)

            // Add spiral motion
            const spiralSpeed = 5
            const rotation = 0.1

            particle.x += Math.cos(angle + rotation) * spiralSpeed
            particle.y += Math.sin(angle + rotation) * spiralSpeed
            particle.alpha = 0.8
            break

          case 'reassemble':
            // Move back to original position
            particle.x += (particle.originX - particle.x) * 0.1
            particle.y += (particle.originY - particle.y) * 0.1
            particle.alpha = Math.min(1, progress * 2)
            break

          case 'complete':
            // Fully reassembled
            particle.x = particle.originX
            particle.y = particle.originY
            particle.alpha = 1
            break
        }

        // Draw particle
        ctx.globalAlpha = particle.alpha
        ctx.fillStyle = particle.color
        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
        ctx.fill()
      })

      ctx.globalAlpha = 1

      animationRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [canvas, phase, progress])

  return { particles: particlesRef.current }
}
