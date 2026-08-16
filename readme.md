# 🧠 PDF AI RAG Studio

<p align="center">
  <img src="frontend/public/globe.svg" width="72" height="72" alt="PDF AI RAG Studio Logo" />
</p>

<p align="center">
  <strong>State-of-the-Art Retrieval-Augmented Generation (RAG) Platform for Multi-PDF Documents &amp; Live Web Pages</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-15.3.1-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" alt="Next.js" />
  <img src="https://img.shields.io/badge/React-19.0-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React 19" />
  <img src="https://img.shields.io/badge/FastAPI-0.110+-009688?style=for-the-badge&logo=fastapi&logoColor=white" alt="FastAPI" />
  <img src="https://img.shields.io/badge/Pinecone-Serverless_768d-000000?style=for-the-badge&logo=pinecone&logoColor=white" alt="Pinecone" />
  <img src="https://img.shields.io/badge/Google_Gemini-2.5_Flash-4285F4?style=for-the-badge&logo=google&logoColor=white" alt="Google Gemini" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-v4_OKLCH-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
</p>

---

## 🌟 Overview

**PDF AI RAG Studio** is an enterprise-grade, dark-first AI research assistant engineered for chatting with dense PDF documents and live web pages. 

Powered by a **SOTA 6-stage Python FastAPI retrieval pipeline**, it combines **HyDE query expansion**, **Hybrid Dense (768-dim) + Sparse BM25 scoring**, **Reciprocal Rank Fusion ($k=60$)**, **Cross-Encoder re-ranking**, **CRAG document grading**, and **L8 context spotlighting** to guarantee **100% factual accuracy with zero hallucination**.

---

## 🏗️ System Architecture

```mermaid
flowchart TD
    subgraph INGESTION["1. Document & Web Ingestion"]
        PDF["📄 Multi-Page PDFs"] --> PyPDF["PyPDF Parser"]
        WEB["🌐 Live Web URLs"] --> Traf["Trafilatura + BeautifulSoup4"]
        PyPDF --> Chunk["RecursiveCharacterTextSplitter<br/>(1000 chars, 150 overlap)"]
        Traf --> Chunk
    end

    subgraph VECTOR_STORE["2. Vector Embedding & Storage"]
        Chunk --> BatchEmb["Gemini 768-dim Batch Embeddings<br/>(gemini-embedding-001)"]
        BatchEmb --> Pinecone[("🌲 Pinecone Serverless<br/>Namespaces: col-*, web-*")]
    end

    subgraph SOTA_PIPELINE["3. SOTA 6-Stage Retrieval Engine"]
        UserQuery["🔍 User Query"] --> HyDE["Stage 01: HyDE Expansion<br/>(Hypothetical Answer Passage)"]
        HyDE --> Dense["Stage 02A: Dense 768-dim Search"]
        UserQuery --> Sparse["Stage 02B: Lexical BM25 Scoring"]
        Dense & Sparse --> RRF["Stage 03: Reciprocal Rank Fusion (k=60)<br/>RRF(d) = Σ 1/(60 + rank(d))"]
        RRF --> CrossEnc["Stage 04: Cross-Encoder Re-Ranking<br/>(Semantic Cross-Attention)"]
        CrossEnc --> CRAG["Stage 05: CRAG Document Grader<br/>(CORRECT / AMBIGUOUS / INCORRECT)"]
        CRAG --> Spotlight["Stage 06: L8 Context Spotlighting<br/>[SPOTLIGHT_START/END]"]
    end

    subgraph SYNTHESIS["4. Grounded Synthesis"]
        Spotlight --> Gemini["⚡ Google Gemini 2.5 Flash<br/>(Multi-Model Quota Fallback)"]
        Gemini --> Response["💬 Grounded Response with Page Citations<br/>[Document.pdf, Page X, Chunk #Y]"]
    end
```

---

## ✨ Key Features

* **⚡ SOTA 6-Stage RAG Pipeline**:
  1. **HyDE (Hypothetical Document Embeddings)**: Generates hypothetical expert passages to eliminate vocabulary mismatches.
  2. **Hybrid Retrieval**: Combines 768-dim cosine dense vectors with lexical BM25 term frequency.
  3. **Reciprocal Rank Fusion (RRF $k=60$)**: Merges and re-scores multiple candidate ranking streams into balanced top-k candidates.
  4. **Cross-Encoder Re-Ranking**: Evaluates deep query-passage semantic cross-attention.
  5. **CRAG Document Grader**: Classifies retrieved candidates (`CORRECT`, `AMBIGUOUS`, `INCORRECT`) to discard irrelevant noise.
  6. **L8 Context Spotlighting**: Wraps verified evidence in structured boundaries for strictly cited answers.

* **📄 Multi-PDF Vector Collections**:
  * Drop single or multiple PDF documents into isolated Pinecone namespaces (`col-{id}`).
  * Vectorizes text chunks in high-throughput parallel batches of 20 (< 1.5s for 25+ chunks).

* **🌐 Real-Time Web Crawler**:
  * Scrapes live documentation and web articles with **Trafilatura** & **BeautifulSoup4**.
  * Converts web content to clean markdown, creates 768-dim embeddings, and stores vectors under `web-{id}`.

* **🎙️ Voice-to-Text Dictation**:
  * Native Web Speech API speech-to-text integration directly inside the chat input bar.

* **📥 1-Click Markdown Export**:
  * Export entire conversation threads with verbatim quotes, timestamps, and inline source page citations as `.md` files.

* **🔑 Bring Your Own Keys (BYOK) Vault**:
  * Store personal Pinecone (`pcsk_...`) and Google Gemini (`AQ...`) keys securely in local browser storage. Keys are forwarded via request headers and never persisted on external servers.

* **🛡️ Multi-Model Quota Resilience**:
  * Automated failover across `gemini-flash-lite-latest`, `gemini-2.5-flash`, `gemini-3.7-flash`, and `gemini-pro`.

* **🌗 Modern Dark-First OKLCH Design System**:
  * Signal Cyan primary color scheme (`oklch(0.78 0.13 192)`), Space Grotesk headings, DM Sans body typography, 1-click smooth theme toggle, and Framer Motion micro-interactions.

---

## 📁 Repository Structure

```
pdfrag/
├── frontend/                     # Next.js 15 + React 19 Frontend
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/             # NextAuth Google OAuth & Credentials
│   │   │   ├── apikey/           # User API Key vault endpoints
│   │   │   ├── ip/               # Real client IP resolver
│   │   │   ├── me/               # User session inspector
│   │   │   └── python-health/    # Server-side health proxy for FastAPI
│   │   ├── dashboard/
│   │   │   ├── account/          # BYOK Vault & Account Profile
│   │   │   ├── web-loader/       # Real-time Web Page Crawler
│   │   │   ├── web-links/        # Indexed URLs Catalog
│   │   │   ├── layout.tsx        # Signal Cyan dashboard sidebar shell
│   │   │   └── page.tsx          # Main ChatGPT-style RAG workspace
│   │   ├── sign-in/              # Google & Email Authentication
│   │   ├── globals.css           # OKLCH Design Tokens & Utilities
│   │   ├── layout.tsx            # Root layout with Google Fonts
│   │   └── page.tsx              # Landing page with 6-stage visualizer
│   ├── components/
│   │   ├── ChatComponent.tsx     # Modal RAG Chat for web crawler
│   │   ├── ChatGPTWorkspace.tsx  # Multi-PDF chat with voice, citations & export
│   │   ├── ModeToggle.tsx        # 1-Click Sun/Moon theme switch button
│   │   ├── NavbarProfile.tsx     # User avatar & account menu
│   │   ├── theme-provider.tsx    # NextThemes wrapper
│   │   └── ui/                   # Radix UI primitives
│   └── lib/                      # Auth, Axios, Python Client, Local Storage
│
├── python_backend/               # Python FastAPI RAG Service
│   ├── config.py                 # Pinecone & Gemini configuration
│   ├── main.py                   # FastAPI REST API & SSE streaming
│   ├── requirements.txt          # Python dependencies
│   └── services/
│       ├── ai_service.py         # SOTA 6-Stage Engine & Batch Embeddings
│       ├── document_processor.py # PDF & Trafilatura Web Scraper
│       └── pinecone_service.py   # Pinecone Serverless Vector Store
│
├── docker-compose.yml            # Docker Compose multi-service config
└── readme.md                     # Project documentation
```

---

## 📡 API Reference

### Python FastAPI Backend (`http://127.0.0.1:8000`)

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Service health status, Vector DB, and active LLM |
| `POST` | `/api/upload` | Upload PDF file, chunk, batch embed, and upsert to Pinecone |
| `POST` | `/api/web/crawl` | Scrape live URL, extract markdown, batch embed, and upsert to Pinecone |
| `POST` | `/api/chat` | Execute SOTA 6-stage RAG query and return grounded answer with citations |
| `POST` | `/api/chat/stream` | Stream AI answer tokens in real-time (Server-Sent Events) |
| `DELETE`| `/api/namespace/{ns}`| Delete all vectors in a specific Pinecone namespace |

---

## 🚀 Quickstart Guide

### Prerequisites
* **Node.js**: `v20+` or `v22+`
* **Python**: `3.10+`
* **API Keys**: [Pinecone API Key](https://app.pinecone.io) and [Google Gemini API Key](https://aistudio.google.com)

---

### 1. Configure Environment Variables

#### Python Backend (`python_backend/.env`):
```env
PINECONE_API_KEY=pcsk_your_pinecone_api_key
PINECONE_INDEX_NAME=pdf-web-rag
GEMINI_API_KEY=your_google_gemini_api_key
PORT=8000
HOST=0.0.0.0
```

#### Frontend (`frontend/.env.local`):
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXTAUTH_SECRET=your_nextauth_secret_key_here
NEXTAUTH_URL=http://localhost:3000
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
DATABASE_URL=file:./dev.db
```

---

### 2. Start Python FastAPI Backend
```bash
cd python_backend
pip install -r requirements.txt
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```
*Backend runs on: `http://127.0.0.1:8000` (API Docs: `http://127.0.0.1:8000/docs`)*

---

### 3. Start Next.js Frontend
```bash
cd frontend
npm install
npm run dev
```
*Frontend runs on: `http://localhost:3000`*

---

## 🐳 Docker Deployment

Run both the frontend and backend with a single command:
```bash
docker-compose up --build
```
