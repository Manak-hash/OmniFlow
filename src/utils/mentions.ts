// Mention regex pattern: @username
// Username rules: 2-20 characters, alphanumeric, underscores, hyphens
const MENTION_PATTERN = /@([a-zA-Z0-9_-]{2,20})/g

export interface Mention {
  id: string
  username: string
  startIndex: number
  endIndex: number
}

export function parseMentions(text: string): Mention[] {
  const mentions: Mention[] = []
  let match

  while ((match = MENTION_PATTERN.exec(text)) !== null) {
    mentions.push({
      id: crypto.randomUUID(),
      username: match[1],
      startIndex: match.index,
      endIndex: match.index + match[0].length
    })
  }

  return mentions
}

export function extractMentionedUserIds(text: string): string[] {
  const mentions = parseMentions(text)
  return mentions.map(m => m.username)
}

export function insertMention(
  text: string,
  cursorPosition: number,
  username: string
): string {
  const before = text.slice(0, cursorPosition)
  const after = text.slice(cursorPosition)

  // Find the @ symbol before cursor
  const lastAtIndex = before.lastIndexOf('@')
  if (lastAtIndex === -1) return text

  // Replace partial mention with full username
  const beforeMention = before.slice(0, lastAtIndex)
  const afterMention = after

  return `${beforeMention}@${username} ${afterMention}`
}

export function isCursorInMention(text: string, cursorPosition: number): boolean {
  const before = text.slice(0, cursorPosition)
  const lastAtIndex = before.lastIndexOf('@')

  if (lastAtIndex === -1) return false

  // Check if there's only valid username chars after @
  const afterAt = before.slice(lastAtIndex + 1)
  const hasInvalidChars = /[^a-zA-Z0-9_-]/.test(afterAt)

  return !hasInvalidChars && afterAt.length <= 20
}

export function getMentionQuery(text: string, cursorPosition: number): string | null {
  if (!isCursorInMention(text, cursorPosition)) return null

  const before = text.slice(0, cursorPosition)
  const lastAtIndex = before.lastIndexOf('@')

  return before.slice(lastAtIndex + 1)
}
