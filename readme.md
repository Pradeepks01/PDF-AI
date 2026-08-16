# 🧠 PDF-AI: State-of-the-Art PDF & Web RAG Platform

An enterprise-ready **Retrieval-Augmented Generation (RAG)** platform designed to ingest multi-page PDF documents and live websites, creating vector embeddings in **Pinecone** and generating grounded, hallucination-free answers using **Google Gemini 2.5 Flash**.

---

## 🏗️ Architecture Overview

```
[ FRONTEND (Next.js 15 + React 19) ]
 ├── NextAuth Google OAuth 2.0 & Salted PBKDF2 Password Hashing
 ├── Browser Web Speech API Voice Typing (STT)
 ├── 1-Click Markdown Session Exporter (.md)
 └── Exact Real-Time Client IP Resolver (/api/ip)
        │
        ▼ (HTTP REST / JSON / Multipart Streams)
[ BACKEND ORCHESTRATOR (Python FastAPI :8000) ]
 ├── Ingestion: PyPDF & Trafilatura + BeautifulSoup4 Web Crawler
 ├── Chunking: LangChain RecursiveCharacterTextSplitter (1000 chars, 150 overlap)
 ├── SOTA Retrieval: HyDE + Dense Vector + Sparse BM25
 ├── Ranking: Reciprocal Rank Fusion (RRF k=60) + Cross-Encoder
 ├── Corrective Grader: CRAG (CORRECT / AMBIGUOUS / INCORRECT)
 └── Grounding: L8 Context Spotlighting ([SPOTLIGHT_START/END])
        │
        ├──► [ PINECONE VECTOR DB ] ── 768-dim Serverless Cosine Index (`col-*`, `web-*`)
        └──► [ GOOGLE GEMINI AI ] ──── `gemini-embedding-001` + 6-Model Rotation Pool
```

---

## ⚡ 6-Stage SOTA RAG Pipeline

1. **HyDE (Hypothetical Document Embeddings)**: Dynamically generates an expert passage answering the query to bridge vocabulary differences.
2. **Dense Vector Search**: Scans 768-dimensional coordinates in Pinecone cloud index.
3. **Sparse BM25 Lexical Ranking**: Computes term-frequency and inverse-document-frequency lexical scores.
4. **Reciprocal Rank Fusion (RRF $k=60$)**: Fuses rankings into a single optimal score:
   $$\text{RRF\_Score}(d) = \sum_{r \in \text{Rankings}} \frac{1}{60 + \text{rank}_r(d)}$$
5. **Cross-Encoder Re-ranking**: Evaluates pairwise query-passage semantic cross-attention and token coverage.
6. **CRAG Document Grader & L8 Spotlighting**: Eliminates irrelevant noise and wraps verified evidence in spotlight delimiters for strictly grounded answers.

---

## 🚀 How to Run

### 1. Python Backend
```bash
cd python_backend
pip install -r requirements.txt
python main.py
```
*Backend runs on `http://localhost:8000`*

### 2. Next.js Frontend
```bash
cd frontend
npm install
npm run dev
```
*Frontend runs on `http://localhost:3000`*
