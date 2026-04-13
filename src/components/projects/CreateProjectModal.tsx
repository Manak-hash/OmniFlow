import { useState } from 'react'
import { Palette, Check } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { cn } from '@/utils/cn'
import { useProjectStore } from '@/store/projectStore'
import { toast } from 'sonner'

const PRESET_COLORS = [
  { name: 'Red', value: '#ef4444' },
  { name: 'Orange', value: '#f97316' },
  { name: 'Amber', value: '#f59e0b' },
  { name: 'Green', value: '#22c55e' },
  { name: 'Teal', value: '#14b8a6' },
  { name: 'Blue', value: '#3b82f6' },
  { name: 'Indigo', value: '#6366f1' },
  { name: 'Purple', value: '#a855f7' },
  { name: 'Pink', value: '#ec4899' },
  { name: 'Gray', value: '#6b7280' }
]

interface CreateProjectModalProps {
  isOpen: boolean
  onClose: () => void
  onProjectCreated?: (projectId: string) => void
}

export function CreateProjectModal({
  isOpen,
  onClose,
  onProjectCreated
}: CreateProjectModalProps) {
  const createProject = useProjectStore((state) => state.createProject)

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [color, setColor] = useState(PRESET_COLORS[5].value)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!name.trim()) {
      newErrors.name = 'Project name is required'
    } else if (name.trim().length > 100) {
      newErrors.name = 'Project name must be 100 characters or less'
    }

    if (description.length > 500) {
      newErrors.description = 'Description must be 500 characters or less'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    try {
      const newProject = createProject({
        name: name.trim(),
        description: description.trim() || undefined,
        color
      })

      toast.success(`Project "${newProject.name}" created successfully`)

      // Reset form
      setName('')
      setDescription('')
      setColor(PRESET_COLORS[5].value)
      setErrors({})

      // Notify parent component
      onProjectCreated?.(newProject.id)

      // Close modal
      onClose()
    } catch (error) {
      toast.error(`Failed to create project: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Project"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-omni-text/70 mb-2">
            Project Name *
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="My Awesome Project"
            className={cn(
              'w-full px-4 py-2 bg-omni-bg/30 border rounded-lg text-omni-text placeholder:text-omni-text/30 focus:outline-none focus:ring-2',
              errors.name ? 'border-red-500 focus:ring-red-500/50' : 'border-omni-text/10 focus:ring-omni-primary/50'
            )}
            autoFocus
          />
          {errors.name && (
            <p className="mt-1 text-xs text-red-400">{errors.name}</p>
          )}
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-omni-text/70 mb-2">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What's this project about?"
            rows={3}
            className={cn(
              'w-full px-4 py-2 bg-omni-bg/30 border rounded-lg text-omni-text placeholder:text-omni-text/30 focus:outline-none focus:ring-2',
              errors.description ? 'border-red-500 focus:ring-red-500/50' : 'border-omni-text/10 focus:ring-omni-primary/50',
              'resize-none'
            )}
          />
          {errors.description && (
            <p className="mt-1 text-xs text-red-400">{errors.description}</p>
          )}
          <p className="mt-1 text-xs text-omni-text/40">
            {description.length}/500
          </p>
        </div>

        {/* Color */}
        <div>
          <label className="block text-sm font-medium text-omni-text/70 mb-2">
            <div className="flex items-center gap-2">
              <Palette className="w-4 h-4" />
              <span>Color</span>
            </div>
          </label>
          <div className="flex flex-wrap gap-2">
            {PRESET_COLORS.map((preset) => (
              <button
                key={preset.value}
                type="button"
                onClick={() => setColor(preset.value)}
                className={cn(
                  'w-8 h-8 rounded-full transition-all',
                  'hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-omni-bg',
                  color === preset.value ? 'ring-2 ring-offset-2 ring-offset-omni-bg' : 'ring-0'
                )}
                style={{
                  backgroundColor: preset.value,
                  '--tw-ring-color': preset.value
                } as React.CSSProperties}
                title={preset.name}
              />
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 pt-4 border-t border-omni-text/10">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2 text-omni-text/70 hover:text-omni-text hover:bg-omni-text/10 rounded-lg transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!name.trim()}
            className="flex-1 px-4 py-2 bg-omni-primary hover:bg-omni-primary/90 text-white rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Check className="w-4 h-4" />
            Create Project
          </button>
        </div>
      </form>
    </Modal>
  )
}
