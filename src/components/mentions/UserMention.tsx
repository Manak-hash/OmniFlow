import { parseMentions } from '@/utils/mentions'

interface UserMentionProps {
  content: string
  onMentionClick?: (username: string) => void
  className?: string
}

export function UserMention({ content, onMentionClick, className }: UserMentionProps) {
  const mentions = parseMentions(content)

  if (mentions.length === 0) {
    return <span className={className}>{content}</span>
  }

  // Sort mentions by position in reverse order to avoid index shifting
  const sortedMentions = [...mentions].sort((a, b) => b.startIndex - a.startIndex)

  // Split content and highlight mentions
  let parts: Array<{ type: 'text' | 'mention'; content: string; username?: string }> = []
  let lastIndex = content.length

  sortedMentions.forEach((mention) => {
    // Add text after mention
    if (mention.endIndex < lastIndex) {
      parts.unshift({
        type: 'text',
        content: content.slice(mention.endIndex, lastIndex)
      })
    }

    // Add mention
    parts.unshift({
      type: 'mention',
      content: content.slice(mention.startIndex, mention.endIndex),
      username: mention.username
    })

    // Add text before mention
    if (mention.startIndex > 0) {
      const textBefore = content.slice(0, mention.startIndex)
      if (parts.length === 0 || parts[0].type !== 'text') {
        parts.unshift({
          type: 'text',
          content: textBefore
        })
      } else {
        parts[0] = {
          type: 'text',
          content: textBefore + parts[0].content
        }
      }
    }

    lastIndex = mention.startIndex
  })

  return (
    <span className={className}>
      {parts.map((part, index) => {
        if (part.type === 'mention') {
          return (
            <span
              key={`mention-${index}`}
              className="text-primary font-medium hover:underline cursor-pointer"
              onClick={() => onMentionClick?.(part.username!)}
            >
              {part.content}
            </span>
          )
        }
        return <span key={`text-${index}`}>{part.content}</span>
      })}
    </span>
  )
}
