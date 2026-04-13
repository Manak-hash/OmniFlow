import { useLocation, useNavigate } from 'react-router-dom'
import { Home, FolderOpen, Settings } from 'lucide-react'
import { cn } from '@/utils/cn'

interface MobileNavItem {
  label: string
  path: string
  icon: React.ComponentType<{ className?: string }>
}

const MOBILE_NAV_ITEMS: MobileNavItem[] = [
  { label: 'Dashboard', path: '/', icon: Home },
  { label: 'Projects', path: '/projects', icon: FolderOpen },
  { label: 'Settings', path: '/settings', icon: Settings }
]

export function MobileNav() {
  const location = useLocation()
  const navigate = useNavigate()

  // Don't show on certain pages if needed
  const hideOnPaths = ['/mindmap/', '/shared/', '/settings']
  const shouldHide = hideOnPaths.some(path => location.pathname.includes(path))

  if (shouldHide) return null

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-omni-bg/95 backdrop-blur-xl border-t border-omni-border safe-area-inset-bottom">
      <div className="flex items-center justify-around h-16">
        {MOBILE_NAV_ITEMS.map((item) => {
          const Icon = item.icon
          const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path))

          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={cn(
                'flex flex-col items-center justify-center gap-1 flex-1 h-full',
                'transition-all duration-200',
                'active:scale-95',
                isActive
                  ? 'text-omni-primary'
                  : 'text-omni-text-secondary hover:text-omni-text'
              )}
              aria-label={item.label}
              aria-current={isActive ? 'page' : undefined}
            >
              <div className="relative">
                <Icon className={cn(
                  'w-5 h-5 transition-transform duration-200',
                  isActive && 'scale-110'
                )} />
                {isActive && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-omni-primary rounded-full" />
                )}
              </div>
              <span className="text-[10px] font-semibold uppercase tracking-wide">{item.label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
