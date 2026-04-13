import { ReactNode } from 'react'
import { getReplicache } from '@/store/replicache'

interface ReplicacheProviderProps {
  children: ReactNode
}

export function ReplicacheProvider({ children }: ReplicacheProviderProps) {
  // Initialize Replicache instance
  getReplicache()

  return <>{children}</>
}

export function useReplicacheInstance() {
  return getReplicache()
}
