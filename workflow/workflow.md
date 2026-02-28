```markdown
# Development Stage — Structured Implementation Plan

## Stack
- Backend: FastAPI
- Frontend: React
- Architecture Style: Agent-compatible modular structure
- AI Layer: Multi-pipeline + Hybrid RAG

---

# 1. Authentication System

## 1.1 Goals
- Default authentication: Email + Password
- Email verification required
- Prepare extensible OAuth structure
- Future-ready Google Auth

---

## 1.2 Backend (FastAPI)

### Modules

```

backend/
├── app/
│   ├── auth/
│   │   ├── routes.py
│   │   ├── service.py
│   │   ├── schemas.py
│   │   ├── models.py
│   │   ├── tokens.py
│   │   └── providers/
│   │       ├── email_provider.py
│   │       └── google_provider.py

```

---

### Core Components

#### User Model
- id
- email
- password_hash
- is_verified
- auth_provider
- created_at

#### Email Verification
- verification_token
- expiration_time
- single-use token

Flow:

```

Register
→ Create user (unverified)
→ Send verification email
→ Verify endpoint
→ Activate account

```

---

### Auth Strategy

#### Email Auth
- Password hashing (argon2 / bcrypt)
- JWT access token
- Refresh token

#### Google Auth (Prepared)
- OAuth callback endpoint
- Provider abstraction:

```

AuthProviderInterface
├── EmailProvider
└── GoogleProvider

```

---

## 1.3 Frontend (React)

```

frontend/
├── src/
│   ├── auth/
│   │   ├── LoginPage.tsx
│   │   ├── RegisterPage.tsx
│   │   ├── VerifyEmailPage.tsx
│   │   └── AuthContext.tsx

```

---

### Auth State

- user
- token
- isAuthenticated
- loading

---

# 2. Dashboard — Project List

## 2.1 Purpose
Central entry point after authentication.

---

## 2.2 Backend Structure

```

backend/app/projects/
├── routes.py
├── service.py
├── models.py
└── schemas.py

```

---

### Project Model

- id
- user_id
- name
- description
- created_at
- updated_at
- last_opened

---

### Endpoints

```

GET    /projects
POST   /projects
DELETE /projects/{id}
PATCH  /projects/{id}

```

---

## 2.3 Frontend Structure

```

frontend/src/features/projects/
├── ProjectDashboard.tsx
├── ProjectCard.tsx
├── CreateProjectModal.tsx

```

---

### Dashboard Behavior

- List projects
- Search projects
- Create new project
- Open project → Canvas Page

---

# 3. Project Canvas Page

## 3.1 Purpose
Main interactive builder workspace.

---

## 3.2 Frontend Structure

```

frontend/src/canvas/
├── CanvasPage.tsx
├── editor/
│   ├── CanvasRenderer.tsx
│   ├── SelectionManager.ts
│   ├── MutationEngine.ts
│   └── StateStore.ts
├── panels/
│   ├── LayersPanel.tsx
│   ├── PropertiesPanel.tsx
│   └── AIAssistantPanel.tsx

```

---

### Core Concepts

#### Element Tree
```

Page
├── Section
│    ├── Heading
│    └── Button

```

#### Selection Modes
- Single select
- Multi select

#### Mutation Engine
- Replace element
- Update style
- Move node
- Delete node

---

## 3.3 Backend Canvas API

```

backend/app/canvas/
├── routes.py
├── schemas.py
└── service.py

```

Endpoints:

```

GET  /project/{id}/canvas
POST /project/{id}/mutation

```

---

# 4. AI System — Three Pipeline Architecture

## Overview

```

AI Gateway
├── Fast Pipeline
├── Think Pipeline
└── Complex Pipeline

```

---

## 4.1 Fast Pipeline

### Purpose
Low latency direct execution.

### Characteristics
- No multi-step reasoning
- Minimal context
- Immediate response

### Use Cases
- Quick style tweak
- Rename element
- Simple suggestions

Flow:

```

Prompt → Model → Result

```

---

## 4.2 Think Pipeline

### Purpose
Structured reasoning.

### Characteristics
- Intermediate reasoning layer
- Context enrichment
- Short planning stage

Flow:

```

Prompt
→ Context Builder
→ Reasoning Model
→ Output

```

Use Cases:
- Layout improvement
- Component recommendation
- UI restructuring

---

## 4.3 Complex Pipeline

### Purpose
Deep reasoning + multi-structure analysis.

### Characteristics
- Multi-step reasoning
- Tool calling
- Structured context graph

Flow:

```

Prompt
→ Planner
→ RAG Retrieval
→ Multi-step Reasoning
→ Validation
→ Output

```

Use Cases:
- Full section redesign
- Database restructuring
- Cross-page consistency

---

# 5. Hybrid RAG System

Reference Architecture Source: :contentReference[oaicite:0]{index=0}

---

## 5.1 RAG Goals

- Non-monotonic retrieval
- Context diversity
- Narrative-aware structure
- Graph + semantic retrieval

---

## 5.2 RAG Architecture

```

RAG Layer
├── Ingestion Pipeline
├── Vector Storage
├── Graph Storage
├── Hybrid Retriever
└── Context Packing

```

---

## 5.3 Ingestion Pipeline

### Small-to-Big Chunking
- Small chunk: detailed context
- Parent chunk: larger semantic grouping

### Entity Extraction
- Element
- Component
- Page
- Database Object

### Metadata
- relation_type
- dependency
- context_scope
- unresolved_flag

---

## 5.4 Storage

### Vector DB
- Semantic similarity search

### Graph DB
- Relationship mapping
- Structural traversal

Graph Nodes:
- UI Elements
- Components
- Database Tables
- Relations

---

## 5.5 Hybrid Retrieval

Combination:

```

Vector Search

* Graph Traversal
* Community Summary Retrieval

```

Ranking:
- Reciprocal Rank Fusion (RRF)

---

## 5.6 Iterative Retrieval

AI pipeline can re-query RAG:

```

Initial Retrieval
→ Reasoning
→ Missing Context Detection
→ Secondary Retrieval

```

---

## 5.7 Context Packing

Priority order:
1. High relevance chunks
2. Structural relations
3. Summary nodes
4. Raw details

---

# 6. Backend Structure (FastAPI Final)

```

backend/
├── app/
│   ├── auth/
│   ├── projects/
│   ├── canvas/
│   ├── ai/
│   │   ├── gateway.py
│   │   ├── pipelines/
│   │   │   ├── fast.py
│   │   │   ├── think.py
│   │   │   └── complex.py
│   │   └── rag/
│   │       ├── ingestion.py
│   │       ├── retriever.py
│   │       ├── graph_store.py
│   │       └── vector_store.py
│   └── shared/

```

---

# 7. Frontend Structure (React Final)

```

frontend/
├── src/
│   ├── auth/
│   ├── dashboard/
│   ├── canvas/
│   ├── ai/
│   │   ├── hooks/
│   │   ├── pipelineClient.ts
│   │   └── aiPanel/
│   └── shared/

```

---

# 8. Agent-Compatible Standards

## Rules

- Every AI action = explicit command
- AI never mutates state directly
- Mutation only via Mutation Engine
- All AI responses structured JSON

---

## AI Response Schema

```

{
"pipeline": "fast|think|complex",
"intent": "",
"recommendations": [],
"preview": [],
"actions": []
}

```

---

# 9. Development Order

## Phase 1
- Email auth
- Verification
- Dashboard project list

## Phase 2
- Canvas page
- Element tree
- Mutation engine

## Phase 3
- Fast AI pipeline

## Phase 4
- Think pipeline

## Phase 5
- Complex pipeline + Hybrid RAG

## Phase 6
- Database recommendation system
- Graph visualization
```
