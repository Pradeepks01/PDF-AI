# 🧠 PDF-AI & Web SOTA RAG Platform

An enterprise-grade, state-of-the-art **Retrieval-Augmented Generation (RAG)** platform for chatting with multi-page PDF documents and live websites with zero hallucinations.

---

## ⚡ Key Highlights & Architecture

- **Frontend**: Next.js 15 (React 19), Tailwind CSS, Lucide Icons, Radix UI.
- **AI Core & RAG Orchestrator**: Python FastAPI (`http://localhost:8000`), PyPDF, Trafilatura, and BeautifulSoup.
- **Vector Database**: Pinecone Serverless (768-dimensional Cosine Similarity, isolated namespaces `col-*` and `web-*`).
- **LLMs & Embeddings**: Google Gemini 2.5 Flash / 2.0 Flash with `gemini-embedding-001`.
- **SOTA 6-Stage Pipeline**:
  1. **HyDE (Hypothetical Document Embeddings)**: Generates hypothetical answer passages to bridge vocabulary gaps.
  2. **Hybrid Retrieval**: Pairs 768-dim Pinecone Dense search with BM25 TF-IDF Sparse lexical matching.
  3. **Reciprocal Rank Fusion (RRF $k = 60$)**: Consolidates Dense, HyDE, and Sparse rankings into an optimal score.
  4. **Cross-Encoder Re-ranking**: Evaluates pairwise query-passage semantic cross-attention and token coverage.
  5. **CRAG (Corrective RAG) Grader**: Classifies passages (`CORRECT`, `AMBIGUOUS`, `INCORRECT`) and filters noise.
  6. **L8 Context Spotlighting**: Wraps verified evidence within `[SPOTLIGHT_START]` / `[SPOTLIGHT_END]` delimiters for pure grounded synthesis.

---

## 🚀 Quick Start Guide

### 1. Start Python Backend
```bash
cd python_backend
pip install -r requirements.txt
python main.py
```
*Backend runs on `http://localhost:8000`*

### 2. Start Next.js Frontend
```bash
cd frontend
npm install
npm run dev
```
*Frontend runs on `http://localhost:3000`*

---

## 🔐 Environment Variables

### Frontend (`frontend/.env.local`)
```env
NEXT_PUBLIC_PYTHON_API_URL=http://localhost:8000
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret_key
GOOGLE_CLIENT_ID=your_google_oauth_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_oauth_client_secret
```

### Backend (`python_backend/.env`)
```env
GEMINI_API_KEY=your_gemini_api_key
PINECONE_API_KEY=your_pinecone_api_key
PINECONE_INDEX_NAME=pdf-web-rag
```
