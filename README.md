# 🧠 NotebookAI — Full-Stack AI Knowledge Workspace

> A production-ready AI-powered knowledge workspace inspired by Google NotebookLM.  
> Built with React + Vite, Node.js + Express, MongoDB Atlas, LangChain, Google Gemini, ChromaDB, and React Flow.

---

## 📁 Folder Structure

```
notebookai/
├── docker-compose.yml          # ChromaDB local dev
├── package.json                # Root monorepo scripts
│
├── backend/
│   ├── .env.example
│   ├── package.json
│   ├── render.yaml             # Render deployment config
│   └── src/
│       ├── server.js           # Express app entry point
│       ├── config/
│       │   └── database.js     # MongoDB connection
│       ├── controllers/
│       │   ├── auth.controller.js
│       │   ├── workspace.controller.js
│       │   ├── document.controller.js
│       │   ├── chat.controller.js
│       │   └── ai.controller.js
│       ├── middleware/
│       │   ├── auth.middleware.js    # JWT verify
│       │   └── error.middleware.js  # Global error handler
│       ├── models/
│       │   ├── user.model.js
│       │   ├── workspace.model.js
│       │   ├── document.model.js
│       │   └── chatHistory.model.js
│       ├── routes/
│       │   ├── auth.routes.js
│       │   ├── workspace.routes.js
│       │   ├── document.routes.js
│       │   ├── chat.routes.js
│       │   └── ai.routes.js
│       └── services/
│           ├── gemini.service.js       # All Gemini AI calls
│           ├── vectorStore.service.js  # ChromaDB + embeddings
│           └── parser.service.js       # PDF/DOCX/TXT/MD parsing
│
└── frontend/
    ├── .env.example
    ├── index.html
    ├── package.json
    ├── vite.config.js
    ├── tailwind.config.js
    ├── postcss.config.js
    ├── vercel.json             # Vercel deployment config
    └── src/
        ├── main.jsx
        ├── App.jsx
        ├── index.css
        ├── store/
        │   └── index.js        # Zustand stores (auth, workspace, docs, chat, ui)
        ├── services/
        │   └── api.js          # Axios instance + all API calls
        └── components/
            ├── auth/
            │   ├── LoginPage.jsx
            │   └── RegisterPage.jsx
            ├── layout/
            │   ├── DashboardLayout.jsx
            │   ├── Sidebar.jsx
            │   └── LandingPage.jsx
            ├── workspace/
            │   ├── WorkspacePage.jsx      # 3-panel layout
            │   ├── WorkspaceHeader.jsx
            │   ├── RightPanel.jsx         # Tab controller
            │   ├── CreateWorkspaceModal.jsx
            │   ├── SourcesPanel.jsx       # File upload + document list
            │   └── SummaryPanel.jsx       # AI summaries
            ├── chat/
            │   └── ChatInterface.jsx      # RAG chat with sources
            ├── mindmap/
            │   └── MindMapPanel.jsx       # React Flow mind map
            ├── flashcard/
            │   └── FlashcardPanel.jsx     # Interactive flashcard study
            ├── quiz/
            │   └── QuizPanel.jsx          # Multiple-choice quiz
            ├── knowledge-graph/
            │   └── KnowledgeGraphPanel.jsx # Entity relationship graph
            └── ui/
                └── Logo.jsx
```

---

## 🗃️ Database Schema

### User
```js
{ name, email, password (bcrypt), workspacesCount, lastActive }
```

### Workspace
```js
{ name, description, owner (ref User), documents [ref Document],
  color, icon, chromaCollectionId, totalDocuments, lastActivity }
```

### Document
```js
{ name, originalName, type (pdf|docx|txt|md), size, filePath,
  workspace, owner, content, chunksCount, isIndexed,
  indexingStatus (pending|processing|completed|failed), indexingError,
  metadata { pageCount, wordCount, author },
  summary { short, detailed, keyInsights, generatedAt } }
```

### ChatHistory
```js
{ workspace, user, title,
  messages [{ role (user|assistant), content, sources [{
    documentId, documentName, excerpt, relevanceScore
  }], timestamp }] }
```

---

## 🔌 API Routes

### Auth `/api/auth`
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/register` | ❌ | Create account |
| POST | `/login` | ❌ | Login + get JWT |
| GET | `/me` | ✅ | Get current user |
| PATCH | `/profile` | ✅ | Update profile |

### Workspaces `/api/workspaces`
| Method | Path | Description |
|--------|------|-------------|
| GET | `/` | List all workspaces |
| POST | `/` | Create workspace |
| GET | `/:id` | Get workspace + docs |
| PUT | `/:id` | Update workspace |
| DELETE | `/:id` | Delete + cleanup |
| GET | `/:id/stats` | Workspace stats |

### Documents `/api/documents`
| Method | Path | Description |
|--------|------|-------------|
| POST | `/workspace/:id/upload` | Upload + parse + index |
| GET | `/workspace/:id` | List documents |
| GET | `/:docId` | Get single document |
| DELETE | `/:docId` | Delete + remove from ChromaDB |
| POST | `/:docId/reindex` | Re-trigger indexing |

### Chat `/api/chat`
| Method | Path | Description |
|--------|------|-------------|
| POST | `/workspace/:id` | Send message (RAG) |
| GET | `/workspace/:id/history` | Get all chat sessions |
| GET | `/session/:chatId` | Get single session |
| DELETE | `/session/:chatId` | Delete session |
| DELETE | `/workspace/:id/clear` | Clear all history |

### AI `/api/ai`
| Method | Path | Params | Description |
|--------|------|--------|-------------|
| GET | `/workspace/:id/summary` | `?type=short\|detailed\|insights` | Generate summary |
| GET | `/workspace/:id/mindmap` | `?documentId=` | Generate mind map JSON |
| GET | `/workspace/:id/flashcards` | `?documentId=` | Generate flashcards |
| GET | `/workspace/:id/quiz` | `?documentId=` | Generate quiz |
| GET | `/workspace/:id/knowledge-graph` | `?documentId=` | Generate entity graph |

---

## 🤖 LangChain / RAG Pipeline

```
Upload → Parse (pdf-parse / mammoth / fs) → Extract Text
                                                    ↓
                              RecursiveCharacterTextSplitter
                              (chunkSize: 1000, overlap: 200)
                                                    ↓
                          GoogleGenerativeAIEmbeddings (embedding-001)
                                                    ↓
                               ChromaDB VectorStore (persist per workspace)
                                                    ↓
         User Query → Embed Query → Similarity Search (top 5 chunks)
                                                    ↓
                         Build Context String from Retrieved Chunks
                                                    ↓
                      Gemini 1.5 Flash → Grounded Answer + Source Attribution
```

---

## 🚀 Local Development Setup

### Prerequisites
- Node.js 18+
- Docker (for ChromaDB)
- MongoDB Atlas account (free tier works)
- Google AI Studio API key (free tier works)

### Step 1 — Clone & Install
```bash
git clone https://github.com/yourname/notebookai.git
cd notebookai
npm run install:all
```

### Step 2 — Start ChromaDB
```bash
docker-compose up -d
# ChromaDB runs at http://localhost:8000
```

### Step 3 — Configure Backend
```bash
cd backend
cp .env.example .env
# Edit .env with your values:
#   MONGODB_URI=<your Atlas connection string>
#   JWT_SECRET=<any long random string>
#   GOOGLE_API_KEY=<from https://aistudio.google.com/app/apikey>
#   CHROMA_URL=http://localhost:8000
#   FRONTEND_URL=http://localhost:5173
```

### Step 4 — Configure Frontend
```bash
cd frontend
cp .env.example .env
# VITE_API_URL=http://localhost:5000/api
```

### Step 5 — Run Everything
```bash
# From root:
npm run dev:backend   # Terminal 1 → port 5000
npm run dev:frontend  # Terminal 2 → port 5173
# ChromaDB already running on 8000
```

Open `http://localhost:5173`

---

## ☁️ Production Deployment

### Backend → Render

1. Push `backend/` to a GitHub repo
2. Go to [render.com](https://render.com) → New Web Service
3. Connect GitHub repo, set **Root Directory** to `backend`
4. Build command: `npm install`
5. Start command: `node src/server.js`
6. Add environment variables from `.env.example`
7. Add a **ChromaDB** service or use [Chroma Cloud](https://trychroma.com)

### Frontend → Vercel

1. Push `frontend/` to a GitHub repo
2. Go to [vercel.com](https://vercel.com) → New Project
3. Import repo, framework preset: **Vite**
4. Add env variable:
   - `VITE_API_URL` = your Render backend URL + `/api`
5. Deploy

### ChromaDB on Render (Free Tier)
```yaml
# Add to render.yaml or create a separate Render service:
# Docker image: chromadb/chroma:latest
# Port: 8000
# Env: IS_PERSISTENT=TRUE
```

---

## 🔑 Getting API Keys

### Google Gemini (Free)
1. Go to https://aistudio.google.com/app/apikey
2. Click **Create API Key**
3. Copy and paste into `GOOGLE_API_KEY`
4. Free tier: 15 RPM, 1M tokens/day — plenty for development

### MongoDB Atlas (Free)
1. Go to https://cloud.mongodb.com
2. Create a free M0 cluster
3. Create a database user
4. Whitelist `0.0.0.0/0` for IP access
5. Get connection string from **Connect > Drivers**

---

## 🛠️ Development Roadmap

### Phase 1 — Foundation ✅
- [x] Project structure and boilerplate
- [x] MongoDB schemas (User, Workspace, Document, ChatHistory)
- [x] JWT auth (register, login, protected routes)
- [x] Workspace CRUD
- [x] File upload with Multer (PDF, DOCX, TXT, MD)

### Phase 2 — RAG Pipeline ✅
- [x] Document parsing service (pdf-parse, mammoth)
- [x] LangChain RecursiveCharacterTextSplitter
- [x] Google Generative AI Embeddings (embedding-001)
- [x] ChromaDB vector store integration
- [x] Similarity search with metadata
- [x] Async background indexing with status tracking

### Phase 3 — AI Features ✅
- [x] RAG chat with source attribution
- [x] AI summaries (short, detailed, insights)
- [x] Mind map generation (hierarchical JSON → React Flow)
- [x] Flashcard generator with flip animation
- [x] Multiple-choice quiz with scoring
- [x] Knowledge graph (entity extraction → React Flow)

### Phase 4 — Frontend ✅
- [x] Landing page
- [x] Auth pages (login, register)
- [x] 3-panel layout (sidebar / chat / right panel)
- [x] Collapsible sidebar with workspace management
- [x] Drag-and-drop file upload with progress
- [x] Document indexing status polling
- [x] Conversational chat UI with markdown rendering
- [x] Source attribution in chat messages
- [x] Interactive React Flow diagrams (mind map + knowledge graph)
- [x] Flashcard study mode with flip animation
- [x] Quiz mode with result scoring
- [x] Zustand state management
- [x] Toast notifications

### Phase 5 — Production
- [ ] Add WebSocket for real-time indexing updates
- [ ] Add collaborative workspace sharing
- [ ] Export mind maps / graphs as PNG
- [ ] Add document search with highlighting
- [ ] Add citation mode (inline source links)
- [ ] Add voice input via Web Speech API
- [ ] Add PDF viewer panel
- [ ] Rate limiting per user (not just per IP)
- [ ] Add refresh token rotation
- [ ] Add email verification

---

## 🏗️ Architecture Overview

```
Browser (React + Vite)
        │
        │  HTTPS / REST API
        ▼
Express.js API (Node.js)
        │
   ┌────┴─────────────────────────────────┐
   │                                       │
MongoDB Atlas                         ChromaDB
(Users, Workspaces,              (Document Embeddings,
 Documents, ChatHistory)          Vector Search)
                                          │
                              Google Generative AI
                              (Gemini 1.5 Flash + embedding-001)
```

---

## 📄 License

MIT — built for educational purposes. Use freely.
