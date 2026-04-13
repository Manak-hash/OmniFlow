import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Zap, Clock, X, Volume2, VolumeX, Info, RotateCcw } from 'lucide-react'
import { useTransitionStore, selectTransitionStyle, selectSoundEnabled } from '@/store/transition'
import type { TransitionStyle } from '@/components/transitions/types'

interface TransitionSettingsProps {
  className?: string
}

export function TransitionSettings({ className }: TransitionSettingsProps) {
  const style = useTransitionStore(selectTransitionStyle)
  const soundEnabled = useTransitionStore(selectSoundEnabled)
  const hasSeenWarning = useTransitionStore((state) => state.hasSeenPhotosensitivityWarning)
  const setStyle = useTransitionStore((state) => state.setStyle)
  const setSoundEnabled = useTransitionStore((state) => state.setSoundEnabled)
  const dismissWarning = useTransitionStore((state) => state.dismissPhotosensitivityWarning)
  const reset = useTransitionStore((state) => state.reset)

  const [showWarning, setShowWarning] = useState(false)
  const [pendingStyle, setPendingStyle] = useState<TransitionStyle | null>(null)

  const handleStyleChange = (newStyle: TransitionStyle) => {
    if (newStyle === 'time-machine' && !hasSeenWarning) {
      setPendingStyle(newStyle)
      setShowWarning(true)
    } else {
      setStyle(newStyle)
    }
  }

  const handleConfirmWarning = () => {
    if (pendingStyle) {
      setStyle(pendingStyle)
      dismissWarning()
      setShowWarning(false)
      setPendingStyle(null)
    }
  }

  const handleCancelWarning = () => {
    setShowWarning(false)
    setPendingStyle(null)
  }

  const handleReset = () => {
    reset()
  }

  const transitionOptions: Array<{
    value: TransitionStyle
    label: string
    description: string
    icon: React.ElementType
    color: string
  }> = [
    {
      value: 'quick',
      label: 'Quick',
      description: '0.5s fade transition (default)',
      icon: Zap,
      color: 'text-blue-400',
    },
    {
      value: 'time-machine',
      label: 'Time Machine',
      description: '4s cinematic wormhole effect',
      icon: Clock,
      color: 'text-purple-400',
    },
    {
      value: 'none',
      label: 'Instant',
      description: 'No animation, instant navigation',
      icon: X,
      color: 'text-gray-400',
    },
  ]

  return (
    <div className={className}>
      {/* Photosensitivity Warning Modal */}
      <AnimatePresence>
        {showWarning && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
              onClick={handleCancelWarning}
            />

            {/* Modal */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-gray-900 border border-gray-700 rounded-2xl p-6 max-w-md w-full shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-yellow-500/20 rounded-lg flex-shrink-0">
                    <Info className="w-6 h-6 text-yellow-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white mb-2">
                      Photosensitivity Warning
                    </h3>
                    <p className="text-gray-300 text-sm leading-relaxed mb-4">
                      The Time Machine transition contains rapid visual effects including
                      flashing lights, spiraling patterns, and screen distortions that may
                      trigger seizures in people with photosensitive epilepsy.
                    </p>
                    <p className="text-gray-400 text-xs mb-4">
                      You can skip the transition at any time by pressing ESC or clicking
                      the Skip button.
                    </p>
                    <div className="flex gap-3">
                      <button
                        onClick={handleConfirmWarning}
                        className="flex-1 px-4 py-2 bg-omni-primary hover:bg-red-500 text-white rounded-lg font-medium transition-colors"
                      >
                        I Understand, Enable
                      </button>
                      <button
                        onClick={handleCancelWarning}
                        className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>

      {/* Transition Settings */}
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-white mb-1">Transition Style</h3>
            <p className="text-sm text-gray-400">
              Choose how OmniToys switches to OmniFlow
            </p>
          </div>
          <button
            onClick={handleReset}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors group"
            title="Reset to defaults"
          >
            <RotateCcw className="w-4 h-4 text-gray-500 group-hover:text-gray-300" />
          </button>
        </div>

        {/* Transition Options */}
        <div className="space-y-2">
          {transitionOptions.map((option) => {
            const Icon = option.icon
            const isSelected = style === option.value

            return (
              <motion.button
                key={option.value}
                onClick={() => handleStyleChange(option.value)}
                className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all duration-200 ${
                  isSelected
                    ? 'bg-omni-primary/10 border-omni-primary/50 shadow-lg shadow-omni-primary/20'
                    : 'bg-gray-800/50 border-gray-700 hover:border-gray-600 hover:bg-gray-800'
                }`}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                <div className={`p-3 rounded-lg ${isSelected ? 'bg-omni-primary/20' : 'bg-gray-700/50'}`}>
                  <Icon className={`w-5 h-5 ${option.color}`} />
                </div>
                <div className="flex-1 text-left">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-white">{option.label}</span>
                    {isSelected && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="px-2 py-0.5 bg-omni-primary text-white text-xs rounded-full"
                      >
                        Active
                      </motion.span>
                    )}
                  </div>
                  <p className="text-sm text-gray-400">{option.description}</p>
                </div>
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-2 h-2 rounded-full bg-omni-primary"
                  />
                )}
              </motion.button>
            )
          })}
        </div>

        {/* Sound Toggle */}
        <div className="pt-4 border-t border-gray-800">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="w-full flex items-center gap-4 p-4 rounded-xl bg-gray-800/50 border border-gray-700 hover:border-gray-600 hover:bg-gray-800 transition-all"
          >
            <div className="p-3 rounded-lg bg-gray-700/50">
              {soundEnabled ? (
                <Volume2 className="w-5 h-5 text-green-400" />
              ) : (
                <VolumeX className="w-5 h-5 text-gray-400" />
              )}
            </div>
            <div className="flex-1 text-left">
              <span className="font-semibold text-white">Sound Effects</span>
              <p className="text-sm text-gray-400">
                {soundEnabled ? 'Enabled' : 'Disabled'} - Only for Time Machine transition
              </p>
            </div>
            <div
              className={`w-12 h-6 rounded-full transition-colors duration-200 ${
                soundEnabled ? 'bg-omni-primary' : 'bg-gray-700'
              }`}
            >
              <motion.div
                animate={{ x: soundEnabled ? 24 : 0 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                className="w-5 h-5 bg-white rounded-full shadow-md"
              />
            </div>
          </button>
        </div>

        {/* Info Note */}
        <div className="flex gap-3 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
          <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-blue-200">
            All transitions are skippable via ESC key or tap. Quick transition is
            recommended for most users. Time Machine is experimental and may impact
            performance on older devices.
          </p>
        </div>
      </div>
    </div>
  )
}
