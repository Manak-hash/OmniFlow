import { Replicache } from 'replicache'
import * as queries from './queries'
import { mutators } from './mutators'

interface ReplicacheConfig {
  name: string
  pushURL?: string
  pullURL?: string
  userId?: string
  licenseKey?: string
}

let replicacheInstance: Replicache<any> | null = null
let initPromise: Promise<void> | null = null

export async function getReplicache(config?: Partial<ReplicacheConfig>): Promise<Replicache<any>> {
  if (!replicacheInstance) {
    const fullConfig: ReplicacheConfig = {
      name: 'omniflow',
      ...config
    }


    replicacheInstance = new Replicache({
      name: fullConfig.name,
      licenseKey: fullConfig.licenseKey,
      pullURL: fullConfig.pullURL,
      pushURL: fullConfig.pushURL,
      mutators,
    })

    // Wait for Replicache to be ready
    initPromise = new Promise((resolve) => {
      // Replicache is ready immediately for local operations
      resolve()
    })

    await initPromise
  }

  return replicacheInstance
}

export async function resetReplicache() {
  if (replicacheInstance) {
    await replicacheInstance.close()
    replicacheInstance = null
  }
  // Clear IndexedDB
  await new Promise<void>((resolve) => {
    const req = indexedDB.deleteDatabase('replicache-omniflow')
    req.onsuccess = () => resolve()
    req.onerror = () => resolve() // Continue even if error
  })
}

export { queries }
