import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { CollapsibleSection } from '@/components/ui/CollapsibleSection'
import { ThemeSelector } from '@/components/ui/ThemeSelector'
import { IntensitySlider } from '@/components/ui/IntensitySlider'
import {
  Shield, Bell, Database, Monitor, Info, ExternalLink, Github,
  Download, Rocket, Trash2, Zap, Globe, Smartphone,
  Palette, ArrowLeft
} from 'lucide-react'
import { usePreferences } from '@/store/preferences'
import { usePWA } from '@/contexts/PWAContext'
import { motion } from 'framer-motion'

// Feature components
function Section({ title, icon: Icon, children }: {
  title: string
  icon?: React.ElementType
  children: React.ReactNode
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 px-1">
        {Icon && <Icon className="w-4 h-4 text-omni-primary" />}
        <h3 className="text-xs font-black uppercase tracking-widest text-omni-text/30">{title}</h3>
      </div>
      <div className="bg-white/[0.02] border border-white/[0.05] rounded-xl overflow-hidden">
        {children}
      </div>
    </div>
  )
}

function SettingRow({
  icon: Icon,
  title,
  description,
  action,
  badge
}: {
  icon: React.ElementType
  title: string
  description?: string
  action: React.ReactNode
  badge?: string
}) {
  return (
    <div className="flex items-center justify-between p-4 gap-4 hover:bg-white/[0.02] transition-colors">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className="w-9 h-9 rounded-lg bg-white/[0.03] border border-white/[0.05] flex items-center justify-center flex-shrink-0">
          <Icon className="w-4 h-4 text-omni-text/40" />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-semibold text-omni-text">{title}</h4>
            {badge && (
              <span className="px-1.5 py-0.5 bg-omni-primary/10 text-omni-primary rounded text-[9px] font-bold uppercase tracking-wider flex-shrink-0">
                {badge}
              </span>
            )}
          </div>
          {description && (
            <p className="text-xs text-omni-text/40 mt-0.5 leading-relaxed">{description}</p>
          )}
        </div>
      </div>
      {action}
    </div>
  )
}

function Toggle({ checked, onChange, label }: {
  checked: boolean
  onChange: (v: boolean) => void
  label?: string
}) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`relative w-11 h-6 rounded-full transition-all duration-200 ${checked ? 'bg-omni-primary shadow-lg shadow-omni-primary/20' : 'bg-white/10'}`}
      aria-label={label}
    >
      <motion.div
        className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow"
        animate={{ x: checked ? 20 : 0 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      />
    </button>
  )
}

function InfoRow({ icon: Icon, label, value, link }: {
  icon: React.ElementType
  label: string
  value: string
  link?: string
}) {
  const content = (
    <>
      <div className="flex items-center gap-2 text-omni-text/40">
        <Icon className="w-4 h-4" />
        <span className="text-xs">{label}</span>
      </div>
      {link ? (
        <a
          href={link}
          target="_blank"
          rel="noreferrer"
          className="text-xs font-mono text-omni-primary hover:underline flex items-center gap-1"
        >
          {value}
          <ExternalLink className="w-3 h-3" />
        </a>
      ) : (
        <span className="text-xs font-mono text-omni-text/60">{value}</span>
      )}
    </>
  )

  return (
    <div className="flex items-center justify-between p-4">
      {content}
    </div>
  )
}

export default function SettingsPage() {
  const navigate = useNavigate()
  const {
    favorites,
    recentTools,
    lowDataMode,
    setLowDataMode,
    vibrationEnabled,
    setVibrationEnabled
  } = usePreferences()

  const { isInstalled, canInstall, installPWA } = usePWA()

  const [cacheSize, setCacheSize] = useState('Calculating...')
  const [notifications, setNotifications] = useState(true)

  // Calculate cache size
  useEffect(() => {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      navigator.storage.estimate().then(({ usage }) => {
        if (usage) {
          const mb = (usage / (1024 * 1024)).toFixed(1)
          setCacheSize(`${mb} MB`)
        }
      })
    }
  }, [])

  const handleFlushData = () => {
    if (confirm('Clear all favorites and recent tools? This cannot be undone.')) {
      // TODO: Implement clearFavorites and clearRecentTools in store
    }
  }

  const stats = [
    { label: 'Favorites', value: favorites.length },
    { label: 'Recent', value: recentTools.length },
    { label: 'Cache', value: cacheSize },
  ]

  const handleInstall = async () => {
    await installPWA()
  }

  return (
    <div className="min-h-screen bg-omni-bg pb-safe lg:pb-0">
      {/* Header */}
      <div className="border-b border-omni-border bg-omni-bg-secondary/30">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex items-center gap-3 sm:gap-4">
            <button
              onClick={() => navigate('/')}
              className="p-2 -ml-2 text-omni-text-secondary hover:text-omni-text hover:bg-omni-bg-secondary rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="min-w-0">
              <h1 className="text-lg sm:text-xl font-semibold text-omni-text truncate">System Configuration</h1>
              <p className="text-xs sm:text-sm text-omni-text-secondary">
                Fine-tune your OmniFlow environment
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-3 sm:grid-cols-3 gap-3">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white/[0.02] border border-white/[0.05] rounded-xl p-3 sm:p-4 text-center"
            >
              <div className="text-xl sm:text-2xl font-bold text-omni-text font-mono">{stat.value}</div>
              <div className="text-[9px] sm:text-[10px] text-omni-text/30 uppercase tracking-wider mt-1">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        {/* PWA Status */}
        <Section title="App Installation" icon={Download}>
          <SettingRow
            icon={Smartphone}
            title="Installation Status"
            description={isInstalled ? "App is installed and running standalone" : "Running in browser"}
            badge={isInstalled ? "INSTALLED" : "WEB"}
            action={
              isInstalled ? (
                <span className="text-xs text-green-400 font-medium flex items-center gap-1">
                  <Shield className="w-3.5 h-3.5" />
                  Active
                </span>
              ) : canInstall ? (
                <button
                  onClick={handleInstall}
                  className="group flex items-center gap-2 px-4 py-2 bg-omni-primary hover:bg-omni-primary-hover text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-200 hover:shadow-lg hover:shadow-omni-primary/30"
                >
                  <Download className="w-3.5 h-3.5 group-hover:animate-bounce" />
                  Install
                </button>
              ) : (
                <span className="text-xs text-omni-text/30 font-medium">Not Available</span>
              )
            }
          />
        </Section>

        {/* Appearance - Collapsible Premium Theme System */}
        <CollapsibleSection
          title="Appearance & Themes"
          icon={Palette}
          defaultOpen={true}
        >
          <IntensitySlider />

          <div className="h-px bg-white/[0.05] my-4" />

          <ThemeSelector />

          <div className="h-px bg-white/[0.05] my-4" />

          <div className="bg-white/[0.02] border border-white/[0.05] rounded-xl overflow-hidden">
            <SettingRow
              icon={Zap}
              title="Low Data Mode"
              description="Disable animations and heavy effects"
              action={
                <Toggle
                  checked={lowDataMode}
                  onChange={setLowDataMode}
                  label="Low data mode"
                />
              }
            />

            <div className="h-px bg-white/[0.05] mx-4" />

            <SettingRow
              icon={Monitor}
              title="Haptic Feedback"
              description="Vibrations for interactions"
              action={
                <Toggle
                  checked={vibrationEnabled}
                  onChange={setVibrationEnabled}
                  label="Haptic feedback"
                />
              }
            />
          </div>
        </CollapsibleSection>

        {/* Notifications */}
        <Section title="Notifications" icon={Bell}>
          <SettingRow
            icon={Bell}
            title="Process Alerts"
            description="Get notified when long-running tasks complete"
            action={
              <Toggle
                checked={notifications}
                onChange={setNotifications}
                label="Process notifications"
              />
            }
          />
        </Section>

        {/* Storage */}
        <Section title="Data & Storage" icon={Database}>
          <SettingRow
            icon={Database}
            title="Local Storage"
            description={`${favorites.length} favorites, ${recentTools.length} recent tools`}
            action={
              <button
                onClick={handleFlushData}
                className="group flex items-center gap-2 px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-500 hover:text-red-400 rounded-lg text-xs font-bold uppercase tracking-wider transition-all"
              >
                <Trash2 className="w-3.5 h-3.5 group-hover:rotate-12 transition-transform" />
                Flush
              </button>
            }
          />
        </Section>

        {/* App Info */}
        <Section title="About" icon={Info}>
          <InfoRow
            icon={Rocket}
            label="Version"
            value="v1.0.0"
          />
          <InfoRow
            icon={Github}
            label="Source"
            value="GitHub Repository"
            link="https://github.com/Manak-hash/OmniFlow"
          />
          <InfoRow
            icon={Globe}
            label="License"
            value="MIT"
          />
        </Section>

        {/* Footer */}
        <div className="text-center space-y-3 pt-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/[0.02] rounded-full border border-white/[0.05]">
            <Shield className="w-3.5 h-3.5 text-green-400" />
            <span className="text-[10px] text-omni-text/30 font-mono">
              All tools run locally • No tracking • No telemetry
            </span>
          </div>
          <p className="text-[9px] text-omni-text/20 leading-relaxed max-w-sm mx-auto">
            OmniFlow is part of the OmniSuite - Progressive Web Apps designed for privacy-focused developers. All processing happens locally in your browser.
          </p>
        </div>
      </div>
    </div>
  )
}
