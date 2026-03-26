import { create } from 'zustand'
import type { ShareLink, ShareLinkStats } from '@/types/share'

interface ShareLinkState {
  links: Map<string, ShareLink>

  // Actions
  setLinks: (links: ShareLink[]) => void
  addLink: (link: ShareLink) => void
  updateLink: (id: string, updates: Partial<ShareLink>) => void
  removeLink: (id: string) => void
  getLinksForMindmap: (mindmapId: string) => ShareLink[]
  getActiveLinksForMindmap: (mindmapId: string) => ShareLink[]
  getLinkByToken: (token: string) => ShareLink | null
  incrementAccessCount: (id: string) => void
  getStats: (mindmapId: string) => ShareLinkStats
  clearLinks: () => void
}

export const useShareLinkStore = create<ShareLinkState>((set, get) => ({
  links: new Map(),

  setLinks: (links: ShareLink[]) => {
    const linkMap = new Map()
    links.forEach(link => linkMap.set(link.id, link))
    set({ links: linkMap })
  },

  addLink: (link: ShareLink) => {
    set((state) => {
      const newLinks = new Map(state.links)
      newLinks.set(link.id, link)
      return { links: newLinks }
    })
  },

  updateLink: (id: string, updates: Partial<ShareLink>) => {
    set((state) => {
      const existing = state.links.get(id)
      if (!existing) return state

      const newLinks = new Map(state.links)
      newLinks.set(id, { ...existing, ...updates })
      return { links: newLinks }
    })
  },

  removeLink: (id: string) => {
    set((state) => {
      const newLinks = new Map(state.links)
      newLinks.delete(id)
      return { links: newLinks }
    })
  },

  getLinksForMindmap: (mindmapId: string) => {
    const state = get()
    const mindmapLinks: ShareLink[] = []

    state.links.forEach((link) => {
      if (link.mindmapId === mindmapId) {
        mindmapLinks.push(link)
      }
    })

    return mindmapLinks.sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
  },

  getActiveLinksForMindmap: (mindmapId: string) => {
    const state = get()
    const activeLinks: ShareLink[] = []

    state.links.forEach((link) => {
      if (link.mindmapId === mindmapId && link.isActive) {
        // Check if expired
        if (link.expiresAt) {
          const now = new Date()
          const expires = new Date(link.expiresAt)
          if (now < expires) {
            activeLinks.push(link)
          }
        } else {
          activeLinks.push(link)
        }
      }
    })

    return activeLinks.sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
  },

  getLinkByToken: (token: string) => {
    const state = get()
    let foundLink: ShareLink | null = null

    state.links.forEach((link) => {
      if (link.token === token && link.isActive) {
        // Check if expired
        if (link.expiresAt) {
          const now = new Date()
          const expires = new Date(link.expiresAt)
          if (now < expires) {
            foundLink = link
          }
        } else {
          foundLink = link
        }
      }
    })

    return foundLink
  },

  incrementAccessCount: (id: string) => {
    set((state) => {
      const existing = state.links.get(id)
      if (!existing) return state

      const newLinks = new Map(state.links)
      newLinks.set(id, {
        ...existing,
        accessCount: existing.accessCount + 1
      })
      return { links: newLinks }
    })
  },

  getStats: (mindmapId: string) => {
    const state = get()
    const mindmapLinks = state.getLinksForMindmap(mindmapId)

    const activeLinks = mindmapLinks.filter(l => l.isActive)
    const totalAccesses = mindmapLinks.reduce((sum, link) => sum + link.accessCount, 0)

    const mostAccessed = mindmapLinks.reduce((max, link) =>
      link.accessCount > (max?.accessCount || 0) ? link : max
    , null as ShareLink | null)

    return {
      totalLinks: mindmapLinks.length,
      activeLinks: activeLinks.length,
      totalAccesses,
      mostAccessed
    }
  },

  clearLinks: () => set({ links: new Map() })
}))
