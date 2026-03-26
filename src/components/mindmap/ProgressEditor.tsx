import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/Input'
import { ProgressBar } from './ProgressBar'
import { validateProgress } from '@/utils/progress'
import { cn } from '@/utils/cn'

interface ProgressEditorProps {
  current: number
  target: number | null
  onChange: (current: number, target: number | null) => void
  size?: 'sm' | 'md' | 'lg'
  className?: string
  disabled?: boolean
}

export function ProgressEditor({
  current,
  target,
  onChange,
  size = 'sm',
  className,
  disabled = false
}: ProgressEditorProps) {
  const [currentValue, setCurrentValue] = useState(current.toString())
  const [targetValue, setTargetValue] = useState(target?.toString() || '')
  const [error, setError] = useState<string | null>(null)

  // Sync with props
  useEffect(() => {
    setCurrentValue(current.toString())
    setTargetValue(target?.toString() || '')
    setError(null)
  }, [current, target])

  const handleCurrentChange = (value: string) => {
    if (disabled) return
    setCurrentValue(value)
    const num = parseFloat(value) || 0
    const validationError = validateProgress(num, target ? parseFloat(targetValue) || null : null)

    if (validationError) {
      setError(validationError)
    } else {
      setError(null)
      onChange(num, target ? parseFloat(targetValue) || null : null)
    }
  }

  const handleTargetChange = (value: string) => {
    if (disabled) return
    setTargetValue(value)
    const targetNum = value ? parseFloat(value) || null : null
    const validationError = validateProgress(current, targetNum)

    if (validationError) {
      setError(validationError)
    } else {
      setError(null)
      onChange(current, targetNum)
    }
  }

  const hasValidTarget = targetValue && !isNaN(parseFloat(targetValue))
  const displayCurrent = parseFloat(currentValue) || 0
  const displayTarget = parseFloat(targetValue) || 0

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex gap-2">
        <Input
          label="Current"
          type="number"
          value={currentValue}
          onChange={(e) => handleCurrentChange(e.target.value)}
          min={0}
          step="any"
          placeholder="0"
          error={error ? undefined : ''}
          disabled={disabled}
        />
        <Input
          label="Target"
          type="number"
          value={targetValue}
          onChange={(e) => handleTargetChange(e.target.value)}
          min={0}
          step="any"
          placeholder="Optional"
          disabled={disabled}
        />
      </div>

      {/* Preview */}
      {hasValidTarget && !error && (
        <ProgressBar
          current={displayCurrent}
          target={displayTarget}
          size={size}
          showPercentage={true}
        />
      )}

      {/* Error Message */}
      {error && (
        <p className="text-xs text-red-400">{error}</p>
      )}
    </div>
  )
}
