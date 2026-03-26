import { useMemo } from 'react'
import { usePresenceStore } from '@/services/presence'
import type { UserPresence } from '@/types/presence'
import { cn } from '@/utils/cn'

interface UserCursorsProps {
  nodeId: string
  className?: string
}

export function UserCursors({ nodeId, className }: UserCursorsProps) {
  const { getUsersOnNode } = usePresenceStore()
  const usersOnNode = useMemo(() => getUsersOnNode(nodeId), [nodeId, getUsersOnNode])

  if (usersOnNode.length === 0) {
    return null
  }

  return (
    <div className={cn('flex items-center gap-1', className)}>
      {usersOnNode.map((user) => (
        <div
          key={user.userId}
          className="flex items-center gap-1 px-2 py-1 rounded-full bg-omni-bg-secondary border border-omni-border"
          title={`${user.userName} is viewing this node`}
        >
          {/* User avatar or initial */}
          {user.userAvatar ? (
            <img
              src={user.userAvatar}
              alt={user.userName}
              className="w-4 h-4 rounded-full"
            />
          ) : (
            <div
              className="w-4 h-4 rounded-full text-[10px] font-bold flex items-center justify-center text-white"
              style={{ backgroundColor: user.userColor }}
            >
              {user.userName.charAt(0).toUpperCase()}
            </div>
          )}
          <span className="text-xs text-omni-text-secondary max-w-[100px] truncate">
            {user.userName}
          </span>

          {/* Editing indicator */}
          {user.isEditing && (
            <span className="w-1.5 h-1.5 rounded-full bg-omni-accent animate-pulse" />
          )}
        </div>
      ))}
    </div>
  )
}

interface RemoteCursorProps {
  user: UserPresence
  containerRef?: React.RefObject<HTMLDivElement>
}

export function RemoteCursor({ user, containerRef }: RemoteCursorProps) {
  if (!user.cursor.nodeId && !containerRef) {
    return null
  }

  // If we have containerRef and cursor position, render absolute cursor
  if (containerRef && user.cursor.x && user.cursor.y) {
    return (
      <div
        className="absolute pointer-events-none z-50 transition-all duration-200"
        style={{
          left: user.cursor.x,
          top: user.cursor.y,
        }}
      >
        <div className="relative">
          {/* Cursor */}
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            className="drop-shadow-md"
          >
            <path
              d="M5.65376 7.89648C5.85934 7.84648 6 7.73291 6 7.59698C6 7.46105 5.85934 7.64748 5.65376 7.89648L3.12679 10.9581C2.54663 11.6919 2.21938 12.6076 2.21938 13.596V20.196C2.21938 20.7493 2.77031 21.2188 3.41887 21.2188C4.06744 21.2188 4.63856 20.7493 4.63856 20.196V13.596C4.63856 12.6076 4.26136 11.6919 3.6812 10.9581L1.15423 7.89648C0.954507 7.64748 1.09516 7.46105 1.09516 7.59698C1.09516 7.73291 0.954507 7.84648 1.15423 7.89648Z"
              fill={user.userColor}
              className="fill-current"
            />
          </svg>

          {/* Name tag */}
          <div
            className="absolute left-5 top-4 px-2 py-1 rounded text-xs text-white whitespace-nowrap"
            style={{ backgroundColor: user.userColor }}
          >
            {user.userName}
            {user.isEditing && ' (editing...)'}
          </div>
        </div>
      </div>
    )
  }

  // If cursor is on a node, render in Node component via UserCursors
  return null
}

interface OnlineUsersProps {
  maxVisible?: number
  className?: string
}

export function OnlineUsers({ maxVisible = 5, className }: OnlineUsersProps) {
  const { users, currentUser } = usePresenceStore()

  const usersList = useMemo(() => {
    return Array.from(users.values())
      .filter(u => u.userId !== currentUser?.userId)
      .sort((a, b) => a.lastSeen.getTime() - b.lastSeen.getTime())
  }, [users, currentUser])

  const visibleUsers = usersList.slice(0, maxVisible)
  const additionalCount = Math.max(0, usersList.length - maxVisible)

  return (
    <div className={cn('flex items-center gap-1', className)}>
      {visibleUsers.map((user) => (
        <div
          key={user.userId}
          className="relative group"
          title={`${user.userName} • ${user.isEditing ? 'Editing' : 'Viewing'}`}
        >
          {user.userAvatar ? (
            <img
              src={user.userAvatar}
              alt={user.userName}
              className="w-8 h-8 rounded-full border-2 border-omni-bg"
            />
          ) : (
            <div
              className="w-8 h-8 rounded-full border-2 border-omni-bg flex items-center justify-center text-sm font-bold text-white"
              style={{ backgroundColor: user.userColor }}
            >
              {user.userName.charAt(0).toUpperCase()}
            </div>
          )}

          {/* Online indicator */}
          <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-omni-bg" />
        </div>
      ))}

      {additionalCount > 0 && (
        <div className="px-2 py-1 bg-omni-bg-secondary rounded-full text-xs text-omni-text-secondary border border-omni-border">
          +{additionalCount} more
        </div>
      )}

      {usersList.length === 0 && (
        <div className="text-xs text-omni-text-tertiary">
          Just you
        </div>
      )}
    </div>
  )
}
