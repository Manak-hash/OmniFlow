import { Replicache } from 'replicache'
import { mutators } from './mutators'
import * as queries from './queries'

interface ReplicacheConfig {
  name: string
  pushURL?: string
  pullURL?: string
  userId?: string
  licenseKey?: string
}

let replicacheInstance: Replicache<typeof mutators> | null = null
let currentUserId: string | null = null

export function getReplicache(config?: Partial<ReplicacheConfig>): Replicache<typeof mutators> {
  if (!replicacheInstance) {
    const fullConfig: ReplicacheConfig = {
      name: 'omniflow',
      userId: currentUserId || undefined,
      ...config
    }

    replicacheInstance = new Replicache({
      name: fullConfig.name,
      licenseKey: fullConfig.licenseKey,
      mutators,
      pullURL: fullConfig.pullURL,
      pushURL: fullConfig.pushURL,
    })
  }
  return replicacheInstance
}

export function setUserId(userId: string) {
  currentUserId = userId
  // Recreate replicache with new user ID
  if (replicacheInstance) {
    replicacheInstance.close()
    replicacheInstance = null
  }
}

export function getCurrentUserId(): string | null {
  return currentUserId
}

export { mutators, queries }
