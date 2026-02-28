# Project Progress Tracking (Mapped from workflow.md)

## Phase 1: Authentication & Dashboard
- [x] 1.1 Backend: Auth Infrastructure
    - [x] Create `workflow/task.md` for progress tracking
    - [x] Initialize database (PostgreSQL)
    - [x] JWT & Security Setup (Session set to 24h)
    - [x] User Model & Schemas
    - [x] Backend Global Error Handling (500 Debugger)
    - [x] Auth Routes & Service
    - [x] Email Provider Implementation
- [x] 1.2 Backend: Project Management
    - [x] Project Model & CRUD
    - [x] Add `layout` field to Project Model
    - [x] Add `content` field to Project Model
- [x] 1.3 Frontend: Auth & Dashboard
    - [x] Login/Register/Verify Pages
    - [x] Dashboard View
    - [ ] New Project Modal: Ask for layout selection
- [ ] 1.4 Layout Systems (Initial Templates)
    - [ ] 1. Vertical / Single Column
    - [ ] 2. Sidebar / Dashboard
    - [ ] 3. Two Column (Content + Sidebar)
    - [ ] 4. Split Screen
    - [ ] 5. Grid
    - [ ] 6. Card-Based
    - [ ] 7. Workspace / App

## Phase 2: Canvas & Editor Foundation
- [x] 2.1 Navigation & Layout Rendering <!-- id: 23 -->
    - [x] Routing for Canvas Page (`/project/:id`)
    - [x] Render base structure from `layouts.md` based on `project.layout`
- [x] 2.2 Selection Mode & Element Highlighting <!-- id: 24 -->
    - [x] Toggle Selection Mode in Editor
    - [x] Visual Hover/Click Highlighting for elements
    - [x] Selected Element state management
- [x] 2.3 Editor UI Enhancements <!-- id: 25 -->
    - [x] Theme Configuration System (Accent Colors)
    - [x] Collapsible Sidebars & Header (Workspace management)
    - [x] Premium UI Refinements <!-- id: 28 -->
        - [x] Updated canvas element hover to use `::after` overlay with low opacity
        - [x] Verified full frontend compliance (no native alert/confirm/prompt/select)
        - [x] VS Code-style Detailed Config Modal with HTML/CSS/JS tabs (Ctrl+E)
        - [x] Linked inline styles to the `style.css` config tab
        - [x] Added Global CSS Config accessible via top header
        - [x] Implemented tooltips displaying sidebar keyboard shortcuts (Alt+1 / Alt+8)
        - [x] Updated Detailed Config notification to display `Config ${id} changed`
        - [x] Fixed Undo (Ctrl+Z) and Redo (Ctrl+Y/Shift+Z) logic to not intercept native text editor events
        - [x] Integrated `react-simple-code-editor` and `prismjs` for VS Code-like syntax highlighting and native Tab behavior
        - [x] Replaced Global CSS Config logo with `{ }`
        - [x] Added placeholder AI Spark buttons to Detailed Config Modal and Floating Toolbox
        - [x] Added Global Script (JS) Config modal and tools

    - [x] AI Spark Integration
        - [x] Create `spark_service.py` with LLM prompt building and JSON schema enforcement
        - [x] Add `POST /api/ai/spark` endpoint in backend
        - [x] Build `SparkModal.jsx` for prompt input and 3-variant preview
        - [x] Wire `SparkModal` to `CanvasPage.jsx` payload and handle apply logic
    - [x] Workspace Layout Refactoring <!-- id: 29 -->
        - [x] **Fixed Panels**: Sidebar and Header now use a robust fixed positioning system relative to the viewport.
        - [x] **Floating Navigation Tools**: Centralized toggles for sidebars and selection mode into a right-aligned floating group.
        - [x] **Zen Mode**: Implemented contextual header toggle that moves between the header and floating tools.
        - [x] **Stable Workspace**: Configured canvas to maintain a constant 0.8x size without shrinking when panels are toggled.
        - [x] **Responsive Workspace**: Main layout architecture finalized and documented.
- [x] 2.4 Element Tree System <!-- id: 26 -->
    - [x] Initial Element Tree representation
    - [x] Visual Element Tree sidebar
    - [x] Figma-style nesting, icons, and collapsibility
    - [x] Robust recursive DOM discovery
    - [x] Deep Discovery & Text Node Wrapping
    - [x] Smart Layer Naming (Isi text muncul di Tree)
- [x] 2.5 Keyboard Shortcut System (Figma-style) <!-- id: 30 -->
    - [x] Navigation & View Shortcuts (Zoom, Pan)
    - [x] Selection & Manipulation Shortcuts (Group, Duplicate)
    - [x] UI Control Shortcuts (Toggle Panels, Search)
    - [x] Tool Selection Shortcuts (Move, Text, etc.)
    - [x] Hierarchical Shortcuts (Enter, Shift+Enter, Tab)
    - [x] Full Screen Toggle (Ctrl + /)
    - [x] Default Sidebar State (Closed on start)
- [x] 2.6 Persistence & Data Integrity
    - [x] Backend 'content' persistence (SQLAlchemy + Pydantic)
    - [x] Database Migrations (Alembic)
    - [x] Frontend 'handleSave' Integration
    - [x] Load State from server on initialization
- [x] 2.7 Element Manipulation & Hotkeys
    - [x] Floating Notification (Glassmorphism)
    - [x] Selection Validation (Add element restricted if no selection)
    - [x] Full Figma-style Manipulation (Duplicate, Rename, Copy/Paste)
    - [x] Property Sharing (Copy/Paste Styles)
    - [x] Element Tree Sync & selection

## Phase 3: AI Fast Pipeline
- [ ] 3.1 AI Gateway
- [ ] 3.2 Fast Pipeline Logic

## Phase 4: Think Pipeline
- [ ] 4.1 Reasoning Layer
- [ ] 4.2 Context Enrichment

## Phase 5: Complex Pipeline & Hybrid RAG
- [ ] 5.1 Ingestion Pipeline
- [ ] 5.2 Hybrid Retriever
- [ ] 5.3 Multi-step Reasoning
