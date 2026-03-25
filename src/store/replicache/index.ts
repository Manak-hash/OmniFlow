import { Replicache } from 'replicache'
import { mutators } from './mutators'
import * as queries from './queries'

let replicacheInstance: Replicache<typeof mutators> | null = null

export function getReplicache(): Replicache<typeof mutators> {
  if (!replicacheInstance) {
    replicacheInstance = new Replicache({
      name: 'omniflows',
      mutators,
      // Note: No pushURL/pullURL = local-only mode
      // Add these later when implementing sync
    })
  }
  return replicacheInstance
}

export { mutators, queries }
