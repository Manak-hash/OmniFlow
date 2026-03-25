import { useState, useEffect } from 'react'
import CodeMirror from '@uiw/react-codemirror'
import { markdown } from '@codemirror/lang-markdown'
import { autocompletion } from '@codemirror/autocomplete'
import type { Node as NodeType } from '@/types/node'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { useUIStore } from '@/store/ui'

interface NodeEditorProps {
  node: NodeType | null
  onUpdate: (id: string, changes: Partial<NodeType>) => void
}

export function NodeEditor({ node, onUpdate }: NodeEditorProps) {
  const { nodeEditorOpen, setNodeEditorOpen } = useUIStore()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')

  // Sync with node
  useEffect(() => {
    if (node) {
      setTitle(node.title)
      setContent(node.content)
    }
  }, [node])

  const handleSave = () => {
    if (node) {
      onUpdate(node.id, { title, content })
      setNodeEditorOpen(false)
    }
  }

  if (!node) return null

  return (
    <Modal
      isOpen={nodeEditorOpen}
      onClose={() => setNodeEditorOpen(false)}
      title="Edit Node"
    >
      <div className="space-y-4">
        <Input
          label="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Node title..."
        />

        <div>
          <label className="block text-sm font-medium mb-2 text-text">
            Content (Markdown)
          </label>
          <CodeMirror
            value={content}
            onChange={(value) => setContent(value)}
            height="300px"
            extensions={[
              markdown(),
              autocompletion(),
            ]}
            className="bg-gray-800 rounded-lg"
          />
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setNodeEditorOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save
          </Button>
        </div>
      </div>
    </Modal>
  )
}
