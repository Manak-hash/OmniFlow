import { Shield, Lock, Eye, MessageCircle, Edit } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import type { Permission } from '@/types/permissions'
import { cn } from '@/utils/cn'

interface PermissionSelectorProps {
  value: Permission
  onChange: (permission: Permission) => void
  disabled?: boolean
  className?: string
}

const PERMISSIONS: { value: Permission; label: string; description: string; icon: any; color: string }[] = [
  {
    value: 'view',
    label: 'Viewer',
    description: 'Can only view',
    icon: Eye,
    color: 'text-gray-400'
  },
  {
    value: 'comment',
    label: 'Commenter',
    description: 'Can view and comment',
    icon: MessageCircle,
    color: 'text-blue-400'
  },
  {
    value: 'edit',
    label: 'Editor',
    description: 'Can edit content',
    icon: Edit,
    color: 'text-green-400'
  },
  {
    value: 'admin',
    label: 'Admin',
    description: 'Full control',
    icon: Shield,
    color: 'text-purple-400'
  }
]

export function PermissionSelector({ value, onChange, disabled = false, className }: PermissionSelectorProps) {
  return (
    <div className={cn('space-y-2', className)}>
      <label className="block text-sm font-medium text-gray-300">Permission Level</label>
      <div className="space-y-2">
        {PERMISSIONS.map((perm) => {
          const Icon = perm.icon
          return (
            <button
              key={perm.value}
              onClick={() => onChange(perm.value)}
              disabled={disabled}
              className={cn(
                'w-full text-left p-3 rounded-lg border-2 transition-all',
                'flex items-center gap-3',
                value === perm.value
                  ? `border-primary bg-${perm.color.split('-')[1]}-900/50`
                  : 'border-gray-700 hover:border-gray-600',
                disabled && 'opacity-50 cursor-not-allowed'
              )}
            >
              <div className={cn('p-2 rounded-lg', `bg-${perm.color.split('-')[1]}-900/50`)}>
                <Icon className={cn('w-4 h-4', perm.color)} />
              </div>
              <div className="flex-1">
                <div className="font-medium text-sm">{perm.label}</div>
                <div className="text-xs text-gray-400">{perm.description}</div>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

interface PermissionBadgeProps {
  permission: Permission
  className?: string
}

export function PermissionBadge({ permission, className }: PermissionBadgeProps) {
  const config = PERMISSIONS.find(p => p.value === permission)

  if (!config) {
    return null
  }

  const Icon = config.icon

  return (
    <div className={cn(
      'inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium',
      `bg-${config.color.split('-')[1]}-900/50`,
      config.color,
      className
    )}>
      <Icon className="w-3 h-3" />
      {config.label}
    </div>
  )
}

interface AccessDeniedProps {
  permission: Permission
  onRequestAccess?: () => void
  className?: string
}

export function AccessDenied({ permission, onRequestAccess, className }: AccessDeniedProps) {
  const config = PERMISSIONS.find(p => p.value === permission)

  if (!config) {
    return null
  }

  return (
    <div className={cn('text-center py-8', className)}>
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-900/30 mb-4">
        <Lock className="w-8 h-8 text-red-400" />
      </div>
      <h3 className="text-lg font-semibold text-text mb-2">Access Denied</h3>
      <p className="text-gray-400 mb-4">
        You need {config.label} permission to access this resource
      </p>
      {onRequestAccess && (
        <Button onClick={onRequestAccess}>
          Request Access
        </Button>
      )}
    </div>
  )
}

interface SharedWithProps {
  memberCount: number
  onClick?: () => void
  className?: string
}

export function SharedWith({ memberCount, onClick, className }: SharedWithProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center gap-2 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 rounded-lg border border-gray-700 transition-colors',
        className
      )}
    >
      <Shield className="w-4 h-4 text-primary" />
      <span className="text-sm text-gray-300">
        Shared with {memberCount} {memberCount === 1 ? 'person' : 'people'}
      </span>
    </button>
  )
}
