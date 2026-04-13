import { useState, useCallback, useEffect, useRef } from 'react'
import {
  Bold, Italic, Code, Link, List, ListOrdered, Quote,
  Heading1, Heading2, Heading3, Strikethrough, CheckSquare
} from 'lucide-react'
import { cn } from '@/utils/cn'
import ReactMarkdown from 'react-markdown'

interface MarkdownEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

type ViewMode = 'split' | 'editor' | 'preview'

export function MarkdownEditor({
  value,
  onChange,
  placeholder = 'Start writing...',
  className
}: MarkdownEditorProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('split')
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [wordCount, setWordCount] = useState(0)
  const [charCount, setCharCount] = useState(0)

  // Update stats
  useEffect(() => {
    setWordCount(value.trim().split(/\s+/).filter(w => w.length > 0).length)
    setCharCount(value.length)
  }, [value])

  // Insert markdown syntax at cursor position
  const insertMarkdown = useCallback((before: string, after: string = '', placeholder: string = '') => {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selected = value.substring(start, end) || placeholder
    const newText = value.substring(0, start) + before + selected + after + value.substring(end)

    onChange(newText)

    // Set cursor position after insertion
    setTimeout(() => {
      const newPos = start + before.length + selected.length
      textarea.setSelectionRange(newPos, newPos)
      textarea.focus()
    }, 0)
  }, [value, onChange])

  // Toolbar actions
  const toolbarActions = [
    { icon: Bold, label: 'Bold', action: () => insertMarkdown('**', '**', 'bold text') },
    { icon: Italic, label: 'Italic', action: () => insertMarkdown('*', '*', 'italic text') },
    { icon: Strikethrough, label: 'Strike', action: () => insertMarkdown('~~', '~~', 'strikethrough') },
    { icon: Heading1, label: 'H1', action: () => insertMarkdown('# ', '', 'Heading 1') },
    { icon: Heading2, label: 'H2', action: () => insertMarkdown('## ', '', 'Heading 2') },
    { icon: Heading3, label: 'H3', action: () => insertMarkdown('### ', '', 'Heading 3') },
    { icon: Code, label: 'Code', action: () => insertMarkdown('`', '`', 'code') },
    { icon: Link, label: 'Link', action: () => insertMarkdown('[', '](url)', 'link text') },
    { icon: List, label: 'Bullet', action: () => insertMarkdown('- ', '', 'List item') },
    { icon: ListOrdered, label: 'Number', action: () => insertMarkdown('1. ', '', 'List item') },
    { icon: Quote, label: 'Quote', action: () => insertMarkdown('> ', '', 'Quote') },
    { icon: CheckSquare, label: 'Task', action: () => insertMarkdown('- [ ] ', '', 'Task') },
  ]

  return (
    <div className={cn('flex flex-col h-full gap-3', className)}>
      {/* Toolbar */}
      <div className="flex items-center gap-1 p-2 bg-omni-bg/40 rounded-xl border border-omni-text/5 overflow-x-auto">
        {toolbarActions.map((action) => (
          <button
            key={action.label}
            onClick={action.action}
            className="p-2 hover:bg-omni-text/10 rounded-lg transition-colors flex-shrink-0"
            title={action.label}
          >
            <action.icon className="w-4 h-4 text-omni-text/50" />
          </button>
        ))}
      </div>

      {/* View Mode Toggle & Stats */}
      <div className="flex items-center justify-between gap-3 px-3 py-2 bg-omni-bg/40 rounded-lg border border-omni-text/5 flex-wrap">
        <div className="flex gap-1 bg-omni-text/5 p-1 rounded-lg">
          <button
            onClick={() => setViewMode('editor')}
            className={`px-3 py-1.5 rounded text-xs font-bold uppercase transition-all ${
              viewMode === 'editor'
                ? 'bg-omni-primary text-white'
                : 'text-omni-text/50 hover:text-omni-text'
            }`}
          >
            Write
          </button>
          <button
            onClick={() => setViewMode('split')}
            className={`px-3 py-1.5 rounded text-xs font-bold uppercase transition-all ${
              viewMode === 'split'
                ? 'bg-omni-primary text-white'
                : 'text-omni-text/50 hover:text-omni-text'
            }`}
          >
            Split
          </button>
          <button
            onClick={() => setViewMode('preview')}
            className={`px-3 py-1.5 rounded text-xs font-bold uppercase transition-all ${
              viewMode === 'preview'
                ? 'bg-omni-primary text-white'
                : 'text-omni-text/50 hover:text-omni-text'
            }`}
          >
            Preview
          </button>
        </div>
        <div className="flex items-center gap-3 text-xs text-omni-text/50">
          <span>{wordCount} words</span>
          <span>{charCount} chars</span>
        </div>
      </div>

      {/* Main Editor Area */}
      <div className="flex-1 min-h-0 flex gap-3">
        {/* Editor Panel */}
        {(viewMode === 'editor' || viewMode === 'split') && (
          <div className="flex-1 flex flex-col bg-omni-bg/30 rounded-xl overflow-hidden border border-omni-text/10">
            <div className="px-4 py-2 bg-omni-text/5 border-b border-omni-text/10">
              <span className="text-xs font-bold text-omni-text/50 uppercase tracking-wider">Write</span>
            </div>
            <textarea
              ref={textareaRef}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder={placeholder}
              className="flex-1 w-full bg-transparent border-none text-sm font-mono text-omni-text p-4 focus:outline-none resize-none min-h-0"
              spellCheck={false}
            />
          </div>
        )}

        {/* Preview Panel */}
        {(viewMode === 'preview' || viewMode === 'split') && (
          <div className="flex-1 flex flex-col bg-omni-bg/30 rounded-xl overflow-hidden border border-omni-text/10">
            <div className="px-4 py-2 bg-omni-text/5 border-b border-omni-text/10">
              <span className="text-xs font-bold text-omni-text/50 uppercase tracking-wider">Preview</span>
            </div>
            <div className="flex-1 p-4 prose prose-invert prose-sm max-w-none overflow-auto">
              {value ? (
                <ReactMarkdown>{value}</ReactMarkdown>
              ) : (
                <p className="text-omni-text/30 italic">Preview will appear here...</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
