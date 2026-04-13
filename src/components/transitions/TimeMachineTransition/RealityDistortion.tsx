import { useEffect, useRef } from 'react'

interface RealityDistortionProps {
  intensity: number // 0-1, increases over time
}

/**
 * Reality distortion effects
 * Warps the entire UI using CSS 3D transforms
 * Creates a "bending space-time" visual effect
 */
export function useRealityDistortion({ intensity }: RealityDistortionProps) {
  const animationRef = useRef<number | undefined>(undefined)

  useEffect(() => {
    const container = document.body
    if (!container) return

    // Apply CSS 3D transform to body
    const applyDistortion = () => {
      const distortion = intensity * 20 // Max 20deg rotation
      const scale = 1 + intensity * 0.1 // Max 10% scale
      const perspective = 1000 - intensity * 500 // Perspective decreases

      container.style.transform = `
        perspective(${perspective}px)
        rotateX(${distortion * 0.3}deg)
        rotateY(${distortion * 0.5}deg)
        scale(${scale})
      `

      // Add chromatic aberration effect via text shadow
      const aberration = intensity * 3
      container.style.textShadow = `
        ${aberration}px 0 rgba(255,0,0,0.3),
        -${aberration}px 0 rgba(0,255,255,0.3)
      `
    }

    // Animate distortion
    let time = 0
    const animate = () => {
      time += 0.02

      applyDistortion()

      animationRef.current = requestAnimationFrame(animate)
    }

    if (intensity > 0) {
      animate()
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }

      // Reset styles
      container.style.transform = ''
      container.style.textShadow = ''
    }
  }, [intensity])
}

/**
 * Component that applies reality distortion to children
 */
export function RealityDistortion({ children, intensity }: { children: React.ReactNode; intensity: number }) {
  useRealityDistortion({ intensity })

  return <>{children}</>
}
