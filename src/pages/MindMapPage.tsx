import { useParams } from 'react-router-dom'
import { ReactFlowProvider } from 'reactflow'
import { MindMapCanvas } from '@/components/mindmap/MindMapCanvas'
import { NodeEditor } from '@/components/mindmap/NodeEditor'
import { TreeTable } from '@/components/views/TreeTable'
import { PanoramicView } from '@/components/views/PanoramicView'
import { KanbanBoard } from '@/components/tasks/KanbanBoard'
import { TaskListView } from '@/components/tasks/TaskListView'
import { QuickTaskModal } from '@/components/tasks/QuickTaskModal'
import { SyncStatus } from '@/components/sync/SyncStatus'
import { OnlineUsers } from '@/components/collab/UserCursors'
import { LayoutSwitcher } from '@/components/mindmap/LayoutSwitcher'
import { ViewModeSwitcher } from '@/components/mindmap/ViewModeSwitcher'
import { ShareDialog } from '@/components/share/ShareDialog'
import logo from '@/assets/icons/OmniToys(WebIcon).png'
import { useMindMap } from '@/hooks/useMindMap'
import { useUIStore } from '@/store/ui'
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'
import { usePresence } from '@/hooks/usePresence'
import { Button } from '@/components/ui/Button'
import { Plus, Share2 } from 'lucide-react'
import { toast } from 'sonner'
import { useState } from 'react'
import { extractAllTags } from '@/utils/tags'
import type { TaskState } from '@/types/node'

export default function MindMapPage() {
  const { id } = useParams()
  const {
    selectedNodeId,
    setNodeEditorOpen,
    setSelectedNode,
    viewMode,
    setViewMode,
    setLayoutAlgorithm,
    allTags
  } = useUIStore()
  const { mindmap, nodes, loading, createChildNode, updateNode, deleteNode } = useMindMap(id || null)

  // Initialize presence tracking for the current user
  // TODO: Get actual user info from authentication
  usePresence({
    userId: 'local-user',
    userName: 'You',
    mindmapId: id || 'default',
    enabled: !!id && !loading
  })

  // Quick task modal state
  const [isQuickModalOpen, setIsQuickModalOpen] = useState(false)
  const [quickTaskDefaultState, setQuickTaskDefaultState] = useState<TaskState | null>(null)
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false)

  // Get all tags for autocomplete
  const availableTags = allTags || extractAllTags(nodes)

  // Keyboard shortcuts
  useKeyboardShortcuts({
    // Node operations
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

    // View mode shortcuts
    'ctrl+1': () => {
      setViewMode('mindmap-focus')
      toast.success('Switched to focus view')
    },
    'ctrl+2': () => {
      setViewMode('mindmap-panoramic')
      toast.success('Switched to panoramic view')
    },
    'ctrl+3': () => {
      setViewMode('tree-table')
      toast.success('Switched to table view')
    },
    'ctrl+4': () => {
      setViewMode('kanban')
      toast.success('Switched to kanban view')
    },
    'ctrl+5': () => {
      setViewMode('task-list')
      toast.success('Switched to task list view')
    },

    // Layout shortcuts
    'ctrl+shift+t': () => {
      setLayoutAlgorithm('tree')
      toast.success('Tree layout applied')
    },
    'ctrl+shift+f': () => {
      setLayoutAlgorithm('force-directed')
      toast.success('Force-directed layout applied')
    },
    'ctrl+shift+r': () => {
      setLayoutAlgorithm('radial')
      toast.success('Radial layout applied')
    },

    // Quick task creation
    'ctrl+shift+n': () => {
      setIsQuickModalOpen(true)
    },
    'meta+shift+n': () => {
      setIsQuickModalOpen(true)
    },

    // Kanban-specific shortcuts (only active in kanban view)
    ...(viewMode === 'kanban' ? {
      'c': () => {
        // Create new task in "To Do" column
        const parentId = selectedNodeId || mindmap?.rootNodeId
        if (parentId) {
          createChildNode(parentId)
          toast.success('New task created')
        }
      },
      'f': () => {
        // Focus search (would need ref to search input)
        toast.info('Press / to search')
      },
      'v': () => {
        // Toggle compact mode (would need access to kanban store)
        toast.info('Toggle view mode from toolbar')
      },
      'b': () => {
        // Toggle bulk mode (would need access to kanban store)
        toast.info('Toggle bulk mode from toolbar')
      }
    } : {})
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

  const selectedNode = nodes?.find(n => n.id === selectedNodeId)

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <header className="h-14 sm:h-16 border-b border-gray-700 flex items-center justify-between px-2 sm:px-4 overflow-x-hidden">
        <div className="flex items-center gap-2 sm:gap-4 min-w-0">
          <div className="flex items-center gap-2 sm:gap-3 group flex-shrink-0">
            <div className="w-8 h-8 sm:w-12 sm:h-12 flex items-center justify-center transition-all duration-700 group-hover:scale-110 group-hover:rotate-6 bg-white/5 rounded-xl sm:rounded-2xl border border-white/10 group-hover:border-red-500/30 relative z-10 overflow-hidden">
              <img src={logo} alt="OmniFlow Logo" className="w-full h-full object-contain p-1 sm:p-1.5" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-2xl sm:text-3xl font-black text-white font-mono tracking-tighter leading-none group-hover:text-white transition-all duration-500 whitespace-nowrap">
                OMNI<span className="text-omni-primary neon-text">FLOW</span>
              </h1>
            </div>
          </div>
          <h1 className="text-sm sm:text-lg font-semibold text-text truncate">{mindmap.name}</h1>
          <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
            <ViewModeSwitcher />
            {viewMode !== 'tree-table' && viewMode !== 'task-list' && <LayoutSwitcher />}
          </div>
        </div>
        <div className="flex items-center gap-1 sm:gap-2 overflow-x-hidden min-w-0">
          <div className="hidden sm:block">
            <OnlineUsers />
          </div>
          <SyncStatus showLabel={false} />
          <div className="flex gap-1 sm:gap-2 flex-shrink-0">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setIsShareDialogOpen(true)}
              title="Share mindmap"
              className="hidden sm:flex"
            >
              <Share2 className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setIsQuickModalOpen(true)}
              title="Quick add task (Ctrl+Shift+N)"
              className="hidden md:flex"
            >
              <Plus className="w-4 h-4 mr-1" />
              Quick Add
            </Button>
            <Button
              size="sm"
              onClick={() => {
                if (mindmap?.rootNodeId) {
                  createChildNode(mindmap.rootNodeId)
                }
              }}
            >
              <Plus className="w-4 h-4 sm:mr-1" />
              <span className="hidden sm:inline">New Node</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Canvas / View */}
      <div className="flex-1 relative">
        {viewMode === 'kanban' ? (
          <KanbanBoard
            nodes={nodes}
            allNodes={nodes}
            selectedNodeId={selectedNodeId}
            onNodeClick={(id) => {
              setSelectedNode(id)
              setNodeEditorOpen(true)
            }}
            onMoveNode={async (nodeId, newState) => {
              await updateNode(nodeId, { state: newState as any })
              toast.success('Task moved')
            }}
            onAddNode={async (state) => {
              const parentId = selectedNodeId || mindmap?.rootNodeId
              if (!parentId) {
                toast.error('No parent node available')
                return
              }
              await createChildNode(parentId)
              // Find the newly created node and set its state
              setTimeout(async () => {
                const siblings = nodes.filter(n => n.parentId === parentId)
                if (siblings.length > 0) {
                  const newNode = siblings[siblings.length - 1]
                  await updateNode(newNode.id, { state: state as any })
                }
              }, 100)
              toast.success('Task created')
            }}
            onEditNode={(nodeId) => {
              setSelectedNode(nodeId)
              setNodeEditorOpen(true)
            }}
            onDuplicateNode={async (nodeId) => {
              const node = nodes.find(n => n.id === nodeId)
              if (node) {
                const parentId = node.parentId || mindmap?.rootNodeId || ''
                await createChildNode(parentId)
                toast.success('Task duplicated')
              }
            }}
            onArchiveNode={async (nodeId) => {
              await updateNode(nodeId, { state: 'stopped' })
              toast.success('Task archived')
            }}
            onDeleteNode={async (nodeId) => {
              await deleteNode(nodeId)
              if (selectedNodeId === nodeId) {
                setSelectedNode(null)
              }
            }}
            onUpdateNode={async (nodeId, changes) => {
              await updateNode(nodeId, changes)
            }}
          />
        ) : viewMode === 'task-list' ? (
          <TaskListView
            nodes={nodes}
            selectedNodeId={selectedNodeId}
            onNodeClick={setSelectedNode}
          />
        ) : viewMode === 'tree-table' ? (
          <TreeTable
            nodes={nodes}
            selectedNodeId={selectedNodeId}
            onNodeClick={setSelectedNode}
          />
        ) : (
          <ReactFlowProvider>
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
            {viewMode === 'mindmap-panoramic' && (
              <PanoramicView nodes={nodes} />
            )}
          </ReactFlowProvider>
        )}
      </div>

      {/* Node Editor */}
      <NodeEditor
        node={selectedNode || null}
        onUpdate={updateNode}
      />

      {/* Quick Task Modal */}
      <QuickTaskModal
        isOpen={isQuickModalOpen}
        onClose={() => {
          setIsQuickModalOpen(false)
          setQuickTaskDefaultState(null)
        }}
        onCreate={async (data) => {
          const parentId = data.parentId || selectedNodeId || mindmap?.rootNodeId
          if (!parentId) {
            toast.error('Please select a parent node first')
            return
          }

          await createChildNode(parentId)
          toast.success('Task created')
        }}
        defaultState={quickTaskDefaultState}
        allTags={availableTags}
        parentNodeTitle={selectedNodeId
          ? nodes.find(n => n.id === selectedNodeId)?.title
          : mindmap?.name
        }
      />

      {/* Share Dialog */}
      {mindmap && (
        <ShareDialog
          isOpen={isShareDialogOpen}
          onClose={() => setIsShareDialogOpen(false)}
          mindmapId={mindmap.id}
          mindmapName={mindmap.name}
        />
      )}
    </div>
  )
}
