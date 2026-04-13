import { usePreferences } from '@/store/preferences'
import { useEffect } from 'react'

export function IntensitySlider() {
  const { themeIntensity, setThemeIntensity } = usePreferences()

  useEffect(() => {
    // Apply intensity via CSS filters
    const saturation = themeIntensity / 100
    const brightness = 0.5 + (themeIntensity / 200)

    document.body.style.filter = `
      saturate(${saturation})
      brightness(${brightness})
    `
  }, [themeIntensity])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value)
    setThemeIntensity(value)
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-omni-text/60 uppercase tracking-wider">
          Theme Intensity
        </label>
        <span className="text-xs font-mono text-omni-text/40">
          {themeIntensity}%
        </span>
      </div>

      <div className="relative h-6 flex items-center">
        <input
          type="range"
          min="0"
          max="100"
          value={themeIntensity}
          onChange={handleChange}
          className="w-full h-2 bg-omni-bg-secondary rounded-lg appearance-none cursor-pointer
            [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4
            [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full
            [&::-webkit-slider-thumb]:bg-omni-primary [&::-webkit-slider-thumb]:shadow-lg
            [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:hover:scale-125"
          aria-label="Theme intensity"
        />
        {/* Track gradient background */}
        <div
          className="absolute top-1/2 left-0 right-0 h-1 -translate-y-1/2 rounded-lg pointer-events-none"
          style={{
            background: `linear-gradient(to right,
              rgba(255,255,255,0.2) 0%,
              var(--color-primary) ${(themeIntensity / 100) * 100}%,
              rgba(255,255,255,0.1) ${(themeIntensity / 100) * 100}%)`
          }}
        />
      </div>

      <div className="flex justify-between text-[10px] text-omni-text/30 uppercase tracking-wider">
        <span>Muted</span>
        <span>Vibrant</span>
      </div>
    </div>
  )
}
