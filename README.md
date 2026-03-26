# OmniFlow

A mindmap-based todo/note management system where tasks ARE notes.

## Phase 1: Foundation ✅

### Completed Features

- ✅ React + Vite + TypeScript setup
- ✅ Replicache local-first storage
- ✅ Basic mindmap visualization with React Flow
- ✅ Tree layout algorithm
- ✅ Create/edit/delete nodes
- ✅ Markdown editor with CodeMirror
- ✅ Keyboard shortcuts
- ✅ IndexedDB persistence

### Current Capabilities

- Create mindmaps with hierarchical nodes
- Edit node titles and markdown content
- Tree-based layout visualization
- Full keyboard navigation
- Local storage (offline-first)

## Getting Started

```bash
npm install
npm run dev
```

Open http://localhost:5173

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| Ctrl/Cmd + N | Create child node |
| Enter | Edit selected node |
| Escape | Deselect |
| Delete | Delete selected node |

## Tech Stack

- React 19.2 + TypeScript
- Vite 7.2
- Tailwind CSS 4.1
- Replicache 15 (local-first state)
- React Flow 11 (mindmap visualization)
- CodeMirror 6 (markdown editor)

## Roadmap

### Phase 2: Core Features (Next)
- [ ] Tree-table view
- [ ] Panoramic view
- [ ] Task states (not-started → in-progress → stopped → finished)
- [ ] Progress tracking (1/12 mushrooms)
- [ ] Tags and references
- [ ] Force-directed and radial layouts

### Phase 3: Advanced Features
- [ ] Global search
- [ ] Keyboard shortcuts system
- [ ] Simple undo/redo
- [ ] Time-travel history

### Phase 4: Advanced Markdown
- [ ] Slash commands
- [ ] Tag autocomplete
- [ ] Wiki links
- [ ] Task lists with sync

### Phase 5: Import/Export
- [ ] JSON backup/restore
- [ ] Markdown export
- [ ] OPML export/import

### Phase 6: Mobile
- [ ] Responsive design
- [ ] Touch gestures
- [ ] Mobile focus view

### Phase 7: Performance
- [ ] Virtualization
- [ ] Performance optimization
- [ ] Web Workers for layouts

### Phase 8: Polish & Deploy
- [ ] Testing
- [ ] PWA
- [ ] Deploy to Vercel

## License

MIT
