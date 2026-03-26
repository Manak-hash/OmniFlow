import type { Node } from '@/types/node'

export interface Conflict {
  nodeId: string
  localVersion: Node
  remoteVersion: Node
  baseVersion: Node
  conflictFields: (keyof Node)[]
}

export interface ConflictResolution {
  nodeId: string
  resolved: Partial<Node>
  strategy: 'local' | 'remote' | 'merge'
}

/**
 * Detect conflicts between local and remote node versions
 */
export function detectConflicts(
  localNodes: Node[],
  remoteNodes: Node[]
): Conflict[] {
  const conflicts: Conflict[] = []
  const localMap = new Map(localNodes.map(n => [n.id, n]))
  const remoteMap = new Map(remoteNodes.map(n => [n.id, n]))

  // Find nodes that exist in both versions
  const allIds = new Set([...localMap.keys(), ...remoteMap.keys()])

  allIds.forEach(nodeId => {
    const local = localMap.get(nodeId)
    const remote = remoteMap.get(nodeId)

    if (local && remote) {
      // Check if versions differ
      if (local.updatedAt !== remote.updatedAt) {
        const conflictFields: (keyof Node)[] = []

        // Check which fields differ
        const fieldKeys: (keyof Node)[] = [
          'title', 'content', 'state', 'progressCurrent', 'progressTarget', 'tags', 'references'
        ]

        fieldKeys.forEach(key => {
          if (JSON.stringify(local[key]) !== JSON.stringify(remote[key])) {
            conflictFields.push(key)
          }
        })

        if (conflictFields.length > 0) {
          conflicts.push({
            nodeId,
            localVersion: local,
            remoteVersion: remote,
            baseVersion: local, // In real implementation, would fetch common ancestor
            conflictFields
          })
        }
      }
    }
  })

  return conflicts
}

/**
 * Auto-resolve conflicts using Last-Write-Wins strategy
 */
export function autoResolveConflicts(
  conflicts: Conflict[],
  prefer: 'local' | 'remote' = 'remote'
): ConflictResolution[] {
  return conflicts.map(conflict => {
    const resolvedVersion = prefer === 'local'
      ? conflict.localVersion
      : conflict.remoteVersion

    return {
      nodeId: conflict.nodeId,
      resolved: {
        title: resolvedVersion.title,
        content: resolvedVersion.content,
        state: resolvedVersion.state,
        progressCurrent: resolvedVersion.progressCurrent,
        progressTarget: resolvedVersion.progressTarget,
        tags: resolvedVersion.tags,
        references: resolvedVersion.references,
        updatedAt: new Date().toISOString()
      },
      strategy: prefer
    }
  })
}

/**
 * Manual conflict resolution with field-level merging
 */
export function mergeConflictFields(
  conflict: Conflict,
  fieldResolutions: Partial<Record<keyof Node, 'local' | 'remote'>>
): Partial<Node> {
  const resolved: any = {}

  conflict.conflictFields.forEach(field => {
    const choice = fieldResolutions[field]
    if (choice === 'local') {
      resolved[field] = conflict.localVersion[field]
    } else {
      resolved[field] = conflict.remoteVersion[field]
    }
  })

  // Always use the most recent updatedAt
  resolved.updatedAt = new Date(
    Math.max(
      new Date(conflict.localVersion.updatedAt).getTime(),
      new Date(conflict.remoteVersion.updatedAt).getTime()
    )
  ).toISOString()

  return resolved
}

/**
 * Smart merge for arrays (tags, references)
 */
export function smartMergeArrays(
  local: string[],
  remote: string[],
  strategy: 'union' | 'prefer-local' | 'prefer-remote' = 'union'
): string[] {
  switch (strategy) {
    case 'union':
      return Array.from(new Set([...local, ...remote]))
    case 'prefer-local':
      return local
    case 'prefer-remote':
      return remote
    default:
      return local
  }
}

/**
 * Check if a conflict can be auto-merged
 */
export function canAutoMerge(conflict: Conflict): boolean {
  // Can auto-merge if:
  // 1. Only array fields differ (tags, references)
  // 2. Non-array fields are the same
  const nonArrayFields = conflict.conflictFields.filter(
    field => field !== 'tags' && field !== 'references'
  )

  return nonArrayFields.length === 0
}

/**
 * Create conflict resolution prompt for UI
 */
export function createConflictPrompt(conflict: Conflict): string {
  const fieldLabels: Record<string, string> = {
    title: 'Title',
    content: 'Content',
    state: 'State',
    progressCurrent: 'Current Progress',
    progressTarget: 'Target Progress',
    tags: 'Tags',
    references: 'References',
    parentId: 'Parent',
    createdAt: 'Created',
    updatedAt: 'Updated'
  }

  const differingFields = conflict.conflictFields
    .map(f => fieldLabels[f] || f)
    .join(', ')

  return `Conflict in "${conflict.localVersion.title}": ${differingFields} differ between local and remote versions.`
}
