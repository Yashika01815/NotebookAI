<div align="center">

# 🧠 NotebookAI

### **Your Documents. Your Knowledge. Your AI.**

A full-stack **AI-powered knowledge workspace** that transforms documents into an interactive learning and research environment using **RAG, vector search, LLMs, embeddings, and knowledge visualization**.

<br/>

<a href="https://github.com/yourname/notebookai">
  <img src="https://img.shields.io/badge/💻_SOURCE_CODE-GitHub-181717?style=for-the-badge&logo=github" />
</a>

<br/><br/>

![React](https://img.shields.io/badge/React-Vite-61DAFB?style=flat-square\&logo=react\&logoColor=black)
![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=flat-square\&logo=node.js\&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=flat-square\&logo=mongodb\&logoColor=white)
![LangChain](https://img.shields.io/badge/LangChain-RAG-1C3C3C?style=flat-square)
![Gemini](https://img.shields.io/badge/Google-Gemini-4285F4?style=flat-square)
![ChromaDB](https://img.shields.io/badge/ChromaDB-Vector%20Database-FF6B35?style=flat-square)
![React Flow](https://img.shields.io/badge/React%20Flow-Visualization-FF007A?style=flat-square)

</div>

---

# 📚 What is NotebookAI?

Reading a large collection of documents usually means constantly switching between:

**📄 Documents → 🔍 Search → 📝 Notes → 🧠 Understanding → 📊 Revision**

NotebookAI brings these workflows into **one intelligent workspace**.

Upload your documents, ask questions about them, generate summaries, create mind maps, build flashcards, take quizzes, and explore relationships between concepts — all from the same knowledge base.

> **NotebookAI turns static documents into an interactive AI knowledge system.** 🚀

---

# ✨ The Experience

```text
                    📚 YOUR DOCUMENTS
                           │
                           ▼
                 ┌───────────────────┐
                 │   📄 Document     │
                 │     Processing    │
                 └─────────┬─────────┘
                           │
                           ▼
                 ✂️ Text Chunking
                           │
                           ▼
                  🧠 Embeddings
                           │
                           ▼
                 🗃️ ChromaDB
                           │
                    Vector Search
                           │
             ┌─────────────┼─────────────┐
             ▼             ▼             ▼
          💬 Chat       📝 Summary     🧠 Mind Map
             │             │             │
             ▼             ▼             ▼
        🎴 Flashcards    📝 Quiz    🕸️ Knowledge Graph
             │             │             │
             └─────────────┼─────────────┘
                           ▼
                     🤖 Gemini AI
```

---

# 🔥 Why NotebookAI?

Traditional document viewers give you **information**.

NotebookAI gives you **interaction with that information**.

### Instead of asking:

> "Where is this information in my 200-page PDF?"

You can ask:

> **"Explain the main argument in Chapter 3."**

Or:

> **"What are the key differences between these two concepts?"**

Or:

> **"Create flashcards from this document."**

Or:

> **"Generate a mind map of the major concepts."**

The system retrieves the relevant information from your documents and uses it as context for the AI response.

---

# 🧠 Core AI Features

## 💬 1. RAG-Powered Document Chat

Ask questions directly against your uploaded documents.

```text
User Question
      ↓
Query Embedding
      ↓
Vector Similarity Search
      ↓
Top Relevant Chunks
      ↓
Context Construction
      ↓
Gemini
      ↓
Grounded Answer
      +
📌 Source Attribution
```

The system doesn't simply send the entire document to the LLM.

Instead, it retrieves the **most relevant chunks** and provides those as context.

This makes the response more focused and allows the application to associate answers with their source documents.

---

# 🔍 Retrieval-Augmented Generation

The heart of NotebookAI is the **RAG pipeline**.

### 📥 Step 1 — Upload

Supported formats:

```text
📄 PDF
📘 DOCX
📝 TXT
📑 Markdown
```

### 🔎 Step 2 — Parse

The document parser extracts readable text.

```text
PDF / DOCX / TXT / MD
          ↓
     Text Extraction
```

### ✂️ Step 3 — Chunk

Large documents are divided into smaller pieces using LangChain's:

**RecursiveCharacterTextSplitter**

Current configuration:

```text
Chunk Size  → 1000
Overlap     → 200
```

The overlap helps preserve context between neighboring chunks.

---

### 🧠 Step 4 — Embeddings

Each chunk is converted into a numerical vector representation using:

**Google Generative AI Embeddings**

```text
Text
 ↓
Embedding Model
 ↓
Vector
```

The vector represents the semantic meaning of the text.

---

### 🗃️ Step 5 — Store

Embeddings are stored in **ChromaDB**.

```text
Document
   ↓
Chunks
   ↓
Embeddings
   ↓
ChromaDB
```

Each workspace maintains its own vector collection.

---

### 🔎 Step 6 — Retrieve

When the user asks a question:

```text
User Query
    ↓
Query Embedding
    ↓
Similarity Search
    ↓
Top 5 Relevant Chunks
```

Only the most relevant information is selected.

---

### 🤖 Step 7 — Generate

The retrieved chunks are converted into a context string and provided to:

**Google Gemini**

```text
Question
   +
Retrieved Context
   ↓
Gemini
   ↓
Grounded Answer
   +
Source Attribution
```

This is the core mechanism behind NotebookAI's document-aware intelligence.

---

# 🎯 AI Study Toolkit

NotebookAI isn't limited to question answering.

A document can become an entire **interactive study environment**.

---

## 📝 AI Summaries

Generate:

### ⚡ Short Summary

A quick overview of the document.

### 📖 Detailed Summary

A deeper explanation of the material.

### 💡 Key Insights

Important concepts extracted from the document.

---

# 🧠 Mind Map Generator

NotebookAI can transform document concepts into a hierarchical structure.

```text
                  📚 DOCUMENT
                       │
            ┌──────────┼──────────┐
            ▼          ▼          ▼
         Concept A  Concept B  Concept C
            │          │
        ┌───┴───┐      ├── Subtopic
        ▼       ▼      └── Example
     Topic 1  Topic 2
```

The generated structure is visualized using **React Flow**.

Instead of reading concepts linearly, users can explore how they relate to one another.

---

# 🎴 AI Flashcards

Turn documents into interactive revision material.

```text
              📄 DOCUMENT
                   ↓
                Gemini
                   ↓
           🎴 FLASHCARDS
                   ↓
       ┌────────────────────┐
       │      QUESTION      │
       │                    │
       │   Flip to reveal   │
       │      the answer    │
       └────────────────────┘
```

Useful for:

* Exam preparation
* Technical learning
* Interview preparation
* Revision

---

# 🧪 AI Quiz Generator

Generate multiple-choice quizzes directly from your documents.

```text
Document
   ↓
AI Question Generation
   ↓
MCQ Quiz
   ↓
User Answers
   ↓
Score
   ↓
📊 Performance
```

This converts passive reading into active learning.

---

# 🕸️ Knowledge Graph

NotebookAI can extract entities and relationships from the document and represent them visually.

```text
              🧠 Knowledge Graph

                    Concept
                   /       \
                  /         \
             Entity A ─── Entity B
                │             │
                │             │
             Related        Related
                │             │
                └──────┬──────┘
                       ▼
                    Entity C
```

The graph is rendered using **React Flow**, allowing users to visually explore relationships between concepts.

---

# 🏗️ System Architecture

```text
                         🌐 BROWSER
                             │
                             ▼
                 ┌─────────────────────┐
                 │    React + Vite     │
                 │      Frontend       │
                 └──────────┬──────────┘
                            │
                       REST API
                            │
                            ▼
                 ┌─────────────────────┐
                 │  Node.js + Express  │
                 │       Backend       │
                 └──────┬────────┬─────┘
                        │        │
             ┌──────────┘        └────────────┐
             ▼                                ▼
     ┌────────────────┐              ┌─────────────────┐
     │ MongoDB Atlas  │              │    ChromaDB     │
     │                │              │                 │
     │ Users          │              │ Embeddings      │
     │ Workspaces     │              │ Vector Search   │
     │ Documents      │              │                 │
     │ Chat History   │              └────────┬────────┘
     └────────────────┘                       │
                                             ▼
                                  ┌────────────────────┐
                                  │ Google Generative  │
                                  │        AI          │
                                  │                    │
                                  │ Gemini + Embedding │
                                  └────────────────────┘
```

---

# 🔄 Complete RAG Architecture

```text
                         📄 DOCUMENT
                              │
                              ▼
                    ┌──────────────────┐
                    │ Document Parser  │
                    └────────┬─────────┘
                             │
                             ▼
                       Extract Text
                             │
                             ▼
              ┌──────────────────────────┐
              │ RecursiveCharacter       │
              │ TextSplitter             │
              │                          │
              │ chunk = 1000             │
              │ overlap = 200            │
              └────────────┬─────────────┘
                           │
                           ▼
                 🧠 Google Embeddings
                           │
                           ▼
                    🗃️ ChromaDB
                           │
                     Store Vectors
                           │
                           │
             ───────── USER QUERY ─────────
                           │
                           ▼
                    Query Embedding
                           │
                           ▼
                 🔎 Similarity Search
                           │
                           ▼
                  Top 5 Relevant Chunks
                           │
                           ▼
                  Build Context
                           │
                           ▼
                    🤖 Gemini
                           │
                           ▼
               Grounded AI Response
                           │
                           ▼
                 📌 Source Attribution
```

---

# 🔐 Authentication

NotebookAI implements protected user access using:

* 🔑 JWT authentication
* 🔒 Protected routes
* 👤 User-specific workspaces
* 🍪 Authenticated API requests
* 🛡️ Middleware-based token verification

Authentication flow:

```text
Register / Login
       ↓
   Credentials
       ↓
   JWT Token
       ↓
Authentication Middleware
       ↓
 Protected Resources
```

---

# 🗂️ Workspace Architecture

Each user can create dedicated workspaces for different knowledge domains.

Example:

```text
👤 User
│
├── 🧠 DSA Preparation
│   ├── Arrays.pdf
│   ├── Graphs.pdf
│   └── Algorithms.pdf
│
├── 📚 Machine Learning
│   ├── ML Notes.pdf
│   └── Deep Learning.pdf
│
└── 💼 Interview Preparation
    ├── Resume.pdf
    ├── Projects.pdf
    └── System Design.pdf
```

Each workspace maintains its own:

* 📄 Documents
* 🧠 Vector collection
* 💬 Chat history
* 📊 Activity information

---

# 🗄️ Database Design

### 👤 User

```text
name
email
password
workspacesCount
lastActive
```

### 🧠 Workspace

```text
name
description
owner
documents
color
icon
chromaCollectionId
totalDocuments
lastActivity
```

### 📄 Document

```text
name
originalName
type
size
filePath
workspace
owner
content
chunksCount
isIndexed
indexingStatus
metadata
summary
```

### 💬 ChatHistory

```text
workspace
user
title
messages
   ├── role
   ├── content
   ├── sources
   └── timestamp
```

---

# 🎨 Frontend Experience

NotebookAI uses a **three-panel workspace interface**:

```text
┌────────────┬─────────────────────────┬──────────────────┐
│            │                         │                  │
│  📁 Source │       💬 AI Chat        │   🧠 AI Tools    │
│   Panel    │                         │                  │
│            │                         │   📝 Summary     │
│ Documents  │    Ask anything about   │   🧠 Mind Map    │
│            │    your documents       │   🎴 Flashcards  │
│ Upload     │                         │   🧪 Quiz        │
│            │                         │   🕸️ Graph       │
│            │                         │                  │
└────────────┴─────────────────────────┴──────────────────┘
```

The right-side AI panel provides access to the different knowledge-generation tools without leaving the workspace.

---

# ⚡ Frontend State Management

The application uses **Zustand** for lightweight state management.

Separate stores handle:

```text
🔐 Authentication
🧠 Workspace
📄 Documents
💬 Chat
🎨 UI State
```

API communication is centralized through an Axios-based service layer.

---

# 🧩 Tech Stack

## 🎨 Frontend

| Technology      | Role                |
| --------------- | ------------------- |
| ⚛️ React        | UI                  |
| ⚡ Vite          | Development / Build |
| 🎨 Tailwind CSS | Styling             |
| 🧭 React Router | Routing             |
| 🐻 Zustand      | State Management    |
| 🔗 Axios        | API Communication   |
| 🕸️ React Flow  | Mind Maps / Graphs  |

---

## ⚙️ Backend

| Technology    | Role           |
| ------------- | -------------- |
| 🟢 Node.js    | Runtime        |
| 🚂 Express.js | REST API       |
| 🍃 Mongoose   | MongoDB ODM    |
| 🔐 JWT        | Authentication |
| 📤 Multer     | File Uploads   |

---

## 🤖 AI Stack

| Technology           | Role                    |
| -------------------- | ----------------------- |
| 🦜 LangChain         | RAG orchestration       |
| 💎 Gemini            | LLM generation          |
| 🧠 Google Embeddings | Semantic representation |
| 🗃️ ChromaDB         | Vector storage          |
| 📄 pdf-parse         | PDF processing          |
| 📘 mammoth           | DOCX processing         |

---

# 📁 Project Structure

```text
notebookai/
│
├── 🐳 docker-compose.yml
├── 📦 package.json
│
├── backend/
│   ├── ⚙️ config/
│   ├── 🎮 controllers/
│   ├── 🛡️ middleware/
│   ├── 🗄️ models/
│   ├── 🛣️ routes/
│   ├── 🔧 services/
│   │   ├── gemini.service.js
│   │   ├── vectorStore.service.js
│   │   └── parser.service.js
│   └── server.js
│
└── frontend/
    ├── src/
    │   ├── store/
    │   ├── services/
    │   └── components/
    │       ├── auth/
    │       ├── layout/
    │       ├── workspace/
    │       ├── chat/
    │       ├── mindmap/
    │       ├── flashcard/
    │       ├── quiz/
    │       └── knowledge-graph/
    │
    └── package.json
```

## The actual repository separates the backend into controllers, middleware, models, routes, and services, while the frontend is organized around workspace, chat, mind-map, flashcard, quiz, and knowledge-graph components.

# 🚀 Getting Started

## Prerequisites

```text
Node.js 18+
Docker
MongoDB Atlas
Google AI Studio API Key
```

---

## 1️⃣ Clone

```bash
git clone https://github.com/yourname/notebookai.git
cd notebookai
```

## 2️⃣ Install

```bash
npm run install:all
```

## 3️⃣ Start ChromaDB

```bash
docker-compose up -d
```

ChromaDB runs locally on:

```text
http://localhost:8000
```

## 4️⃣ Configure Backend

```bash
cd backend
cp .env.example .env
```

Configure:

```text
MONGODB_URI
JWT_SECRET
GOOGLE_API_KEY
CHROMA_URL
FRONTEND_URL
```

## 5️⃣ Configure Frontend

```bash
cd frontend
cp .env.example .env
```

Set:

```text
VITE_API_URL=http://localhost:5000/api
```

## 6️⃣ Run

```bash
npm run dev:backend
```

```bash
npm run dev:frontend
```

Open:

```text
http://localhost:5173
```

---

# 📊 API Architecture

NotebookAI exposes REST APIs organized around five major domains:

```text
/api/auth
     │
     ├── Register
     ├── Login
     ├── Current User
     └── Profile

/api/workspaces
     │
     ├── Create
     ├── Read
     ├── Update
     ├── Delete
     └── Statistics

/api/documents
     │
     ├── Upload
     ├── Parse
     ├── Index
     ├── Delete
     └── Re-index

/api/chat
     │
     ├── RAG Question
     ├── History
     └── Sessions

/api/ai
     │
     ├── Summary
     ├── Mind Map
     ├── Flashcards
     ├── Quiz
     └── Knowledge Graph
```

The implemented API structure includes dedicated routes for authentication, workspaces, documents, chat, and AI functionality.

---

# ☁️ Deployment

### Backend

Designed for deployment on:

**Render**

### Frontend

Designed for deployment on:

**Vercel**

### Vector Database

Can run using:

**ChromaDB**

either locally through Docker or through a hosted Chroma deployment.

---

# 🗺️ Development Roadmap

### ✅ Foundation

* [x] Project architecture
* [x] MongoDB schemas
* [x] JWT authentication
* [x] Workspace CRUD
* [x] File uploads
* [x] PDF / DOCX / TXT / MD parsing

### ✅ RAG Engine

* [x] Text chunking
* [x] Google embeddings
* [x] ChromaDB integration
* [x] Similarity search
* [x] Source metadata
* [x] Background indexing

### ✅ AI Layer

* [x] RAG chat
* [x] Source attribution
* [x] AI summaries
* [x] Mind maps
* [x] Flashcards
* [x] Quizzes
* [x] Knowledge graphs

### ✅ Frontend

* [x] Landing page
* [x] Authentication
* [x] Workspace UI
* [x] Three-panel layout
* [x] Drag-and-drop upload
* [x] Indexing status
* [x] Markdown chat
* [x] Interactive graphs
* [x] Flashcard mode
* [x] Quiz mode
* [x] Zustand state management

The uploaded project documentation marks these foundation, RAG, AI, and frontend phases as completed.

---

# 🔮 What's Next?

The next evolution of NotebookAI focuses on making the workspace more collaborative and production-ready.

### 🚧 Planned

* [ ] 🔄 Real-time indexing updates
* [ ] 👥 Collaborative workspaces
* [ ] 🖼️ Export mind maps / graphs
* [ ] 🔍 Document search + highlighting
* [ ] 📌 Inline citation mode
* [ ] 🎙️ Voice input
* [ ] 📖 Integrated PDF viewer
* [ ] 🚦 User-level rate limiting
* [ ] 🔄 Refresh-token rotation
* [ ] ✉️ Email verification

---

# 💡 Engineering Highlights

NotebookAI is more than a CRUD application with an LLM API.

The project demonstrates:

```text
                 🧠 NotebookAI
                      │
       ┌──────────────┼──────────────┐
       ▼              ▼              ▼
   📄 Documents    🤖 AI/RAG      🎨 Frontend
       │              │              │
       ▼              ▼              ▼
   Parsing         Embeddings      React
       │           ChromaDB        Zustand
       │           LangChain       React Flow
       ▼              │              │
   Chunking          ▼              ▼
                  Gemini         Interactive UI
       │              │
       └──────────────┼──────────────┘
                      ▼
              🚀 Full-Stack AI
                 Workspace
```

### The most important engineering concepts demonstrated:

* 🧠 **Retrieval-Augmented Generation**
* 🔎 **Semantic Vector Search**
* 🗃️ **Vector Database Architecture**
* 🔗 **LangChain Pipelines**
* 🤖 **LLM Integration**
* 📄 **Document Processing**
* 🔐 **JWT Authentication**
* 🏗️ **REST API Architecture**
* 🗄️ **MongoDB Data Modeling**
* 🕸️ **Knowledge Graph Visualization**
* 🧠 **AI-powered Learning Tools**
* ⚡ **Full-stack application architecture**

---

# 🎯 The Core Idea

NotebookAI isn't trying to replace your documents.

It makes them **interactive**.

```text
          📄 STATIC DOCUMENT
                  │
                  ▼
             🧠 NOTEBOOKAI
                  │
       ┌──────────┼──────────┐
       ▼          ▼          ▼
     ASK        LEARN      EXPLORE
       │          │          │
       ▼          ▼          ▼
     💬 RAG     🎴 Cards    🕸️ Graph
     📝 Summary 🧪 Quiz     🧠 Mind Map
                  │
                  ▼
              UNDERSTAND
```

> ### **Upload knowledge. Ask questions. Discover connections. Learn faster. 🚀**

---

<div align="center">

# ⭐ NotebookAI

### **From documents to knowledge.**

Built with ❤️ using

**React • Node.js • MongoDB • LangChain • Gemini • ChromaDB**

<br/>

**🧠 RAG • 🔎 Vector Search • 🤖 LLMs • 🕸️ Knowledge Graphs**

<br/>

⭐ **If this project helped you, consider starring the repository!**

</div>
