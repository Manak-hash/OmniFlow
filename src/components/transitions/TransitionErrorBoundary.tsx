import { Component, ReactNode } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'

interface Props {
  children: ReactNode
  targetUrl: string
  fallback?: ReactNode
  onError?: (error: Error) => void
}

interface State {
  hasError: boolean
  error: Error | null
}

/**
 * Error boundary for transition components
 *
 * Catches any errors during transition animation and falls back to instant navigation
 * This ensures users never get stuck if the transition fails
 */
export class TransitionErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error for debugging
    console.error('[Transition Error Boundary]', error, errorInfo)

    // Notify parent component
    this.props.onError?.(error)

    // Fallback: navigate immediately
    setTimeout(() => {
      window.location.href = this.props.targetUrl
    }, 100)
  }

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback
      }

      // Default error UI
      return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-omni-bg">
          <div className="max-w-md mx-auto p-6 text-center">
            <div className="flex justify-center mb-4">
              <div className="p-4 bg-red-500/20 rounded-full">
                <AlertTriangle className="w-8 h-8 text-red-400" />
              </div>
            </div>

            <h2 className="text-xl font-bold text-white mb-2">
              Transition Error
            </h2>

            <p className="text-gray-400 text-sm mb-6">
              Something went wrong during the transition. Don't worry,
              we're redirecting you now...
            </p>

            {this.state.error && (
              <details className="text-left mb-4">
                <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-400">
                  Technical details
                </summary>
                <pre className="mt-2 p-3 bg-gray-900 rounded-lg text-xs text-red-400 overflow-auto max-h-32">
                  {this.state.error.message}
                </pre>
              </details>
            )}

            <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Redirecting...</span>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
