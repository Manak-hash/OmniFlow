import { useParams } from 'react-router-dom'
import { MindMapCanvas } from '@/components/mindmap/MindMapCanvas'
import { NodeEditor } from '@/components/mindmap/NodeEditor'
import { useMindMap } from '@/hooks/useMindMap'
import { useUIStore } from '@/store/ui'
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'
import { Button } from '@/components/ui/Button'
import { Plus } from 'lucide-react'
import { toast } from 'sonner'

export default function MindMapPage() {
  const { id } = useParams()
  const { selectedNodeId, setNodeEditorOpen, setSelectedNode } = useUIStore()
  const { mindmap, nodes, loading, createChildNode, updateNode, deleteNode } = useMindMap(id || null)

  // Keyboard shortcuts
  useKeyboardShortcuts({
    'ctrl+n': () => {
      if (selectedNodeId) {
        createChildNode(selectedNodeId)
        toast.success('Child node created')
      }
    },
    'meta+n': () => {
      if (selectedNodeId) {
        createChildNode(selectedNodeId)
        toast.success('Child node created')
      }
    },
    'escape': () => {
      setSelectedNode(null)
    },
    'delete': () => {
      if (selectedNodeId) {
        deleteNode(selectedNodeId)
        setSelectedNode(null)
        toast.success('Node deleted')
      }
    },
    'enter': () => {
      if (selectedNodeId) {
        setNodeEditorOpen(true)
      }
    },
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-text">Loading...</div>
      </div>
    )
  }

  if (!mindmap) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-text">MindMap not found</div>
      </div>
    )
  }

  const selectedNode = nodes.find(n => n.id === selectedNodeId)

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <header className="h-14 border-b border-gray-700 flex items-center justify-between px-4">
        <h1 className="text-lg font-semibold text-text">{mindmap.name}</h1>
        <div className="flex gap-2">
          <Button
            size="sm"
            onClick={() => {
              if (mindmap.rootNodeId) {
                createChildNode(mindmap.rootNodeId)
                toast.success('Root child created')
              }
            }}
          >
            <Plus className="w-4 h-4 mr-1" />
            New Node
          </Button>
        </div>
      </header>

      {/* Canvas */}
      <div className="flex-1">
        <MindMapCanvas
          nodes={nodes}
          selectedNodeId={selectedNodeId}
          onNodeClick={setSelectedNode}
          onCreateChild={(parentId) => {
            createChildNode(parentId)
            toast.success('Child node created')
          }}
          onDelete={(nodeId) => {
            deleteNode(nodeId)
            setSelectedNode(null)
            toast.success('Node deleted')
          }}
        />
      </div>

      {/* Node Editor */}
      <NodeEditor
        node={selectedNode || null}
        onUpdate={updateNode}
      />
    </div>
  )
}
