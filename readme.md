# PDF AI

A production-grade Retrieval-Augmented Generation (RAG) platform engineered for grounded querying across multi-page PDF documents and live web pages. The platform pairs a Next.js 15 frontend with a Python FastAPI retrieval backend, utilizing Google Gemini 2.5 Flash and Pinecone serverless vector storage.

---

## Project Impact

### 1. Elimination of Hallucinations with Verifiable Grounding
Standard large language models struggle with dense factual domain documents, often producing hallucinations or unsupported inferences. PDF AI implements a multi-stage retrieval architecture with context spotlighting and document grading, ensuring that every generated answer is strictly anchored to uploaded document content with precise page and chunk citations.

### 2. High-Throughput Multi-Document and Web Synthesis
Users can ingest multiple dense PDF files and live web documentation simultaneously. By vectorizing content into isolated namespace partitions, the system allows complex cross-document queries, comparative analysis, and instant knowledge synthesis across hundreds of pages in sub-second response times.

### 3. Complete Data Privacy via BYOK (Bring Your Own Key) Architecture
Enterprise and research workflows demand stringent confidentiality. PDF AI features a client-side API Key Vault that stores personal Pinecone and Google Gemini keys in local browser storage. Keys are transmitted only in ephemeral request headers directly to processing services, ensuring zero persistent server-side credential storage or third-party telemetry.

### 4. Accelerated Research and Operational Efficiency
By combining automated PDF chunking, Trafilatura web crawling, speech-to-text dictation, and one-click markdown exports, PDF AI reduces manual document analysis time from hours to seconds for legal, academic, financial, and technical domains.

---

## System Architecture

```mermaid
flowchart TD
    subgraph INGESTION["1. Document and Web Ingestion"]
        PDF["Multi-Page PDFs"] --> PyPDF["PyPDF Parser"]
        WEB["Live Web URLs"] --> Traf["Trafilatura and BeautifulSoup4"]
        PyPDF --> Chunk["RecursiveCharacterTextSplitter (1000 chars, 150 overlap)"]
        Traf --> Chunk
    end

    subgraph VECTOR_STORE["2. Vector Embedding and Storage"]
        Chunk --> BatchEmb["Gemini 768-dim Batch Embeddings (gemini-embedding-001)"]
        BatchEmb --> Pinecone[("Pinecone Serverless Vector Database (Namespaces: col-*, web-*)")]
    end

    subgraph SOTA_PIPELINE["3. 6-Stage Advanced Retrieval Engine"]
        UserQuery["User Query"] --> HyDE["Stage 01: HyDE Expansion (Hypothetical Passage)"]
        HyDE --> Dense["Stage 02A: Dense 768-dim Search"]
        UserQuery --> Sparse["Stage 02B: Lexical BM25 Scoring"]
        Dense & Sparse --> RRF["Stage 03: Reciprocal Rank Fusion (k=60)"]
        RRF --> CrossEnc["Stage 04: Cross-Encoder Re-Ranking"]
        CrossEnc --> CRAG["Stage 05: CRAG Document Grader"]
        CRAG --> Spotlight["Stage 06: L8 Context Spotlighting"]
    end

    subgraph SYNTHESIS["4. Grounded Synthesis"]
        Spotlight --> Gemini["Google Gemini 2.5 Flash (Multi-Model Failover)"]
        Gemini --> Response["Grounded Response with Inline Page Citations"]
    end
```

### Retrieval Pipeline Stages

1. **HyDE (Hypothetical Document Embeddings)**: Generates a speculative expert passage to capture semantic intent, eliminating vocabulary mismatches between user queries and raw document text.
2. **Hybrid Retrieval (Dense + Sparse)**: Concurrently computes 768-dimensional cosine similarity vectors and BM25 lexical term scores to balance semantic depth with exact keyword matching.
3. **Reciprocal Rank Fusion (RRF $k=60$)**: Synthesizes multiple rank positions into a single unified score using the formula:
   $$RRF(d) = \sum_{m \in M} \frac{1}{60 + r_m(d)}$$
4. **Cross-Encoder Semantic Re-Ranking**: Performs deep cross-attention evaluations over top candidate pairs to re-score relevance with high precision.
5. **Corrective RAG (CRAG) Document Grader**: Classifies passages into `CORRECT`, `AMBIGUOUS`, or `INCORRECT`, discarding non-relevant chunks before synthesis.
6. **L8 Context Spotlighting**: Encloses verified factual chunks in strict spotlight boundaries, guiding the generator to cite source files, page numbers, and exact quotes.

---

## Tech Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend Framework** | Next.js 15 (App Router), React 19 | Server and client rendering, route handlers, dynamic layout architecture |
| **Language** | TypeScript, Python 3.10+ | End-to-end type safety and backend computational efficiency |
| **Styling & UI** | Tailwind CSS v4, Radix UI Primitives, Lucide Icons | Responsive glassmorphic interface, dark/light theme tokens |
| **Backend Framework** | FastAPI, Uvicorn, Pydantic | High-performance asynchronous REST endpoints and Server-Sent Events |
| **Vector Database** | Pinecone Serverless (768 dimensions) | Scalable vector indexing with isolated namespace partitioning |
| **LLM & Embeddings** | Google Gemini 2.5 Flash, Gemini Embedding | Sub-second generative answers, semantic embeddings, quota failover |
| **Parsing & Ingestion** | PyPDF, Trafilatura, BeautifulSoup4 | Multi-page PDF extraction and live web scraping |
| **Authentication** | NextAuth.js, Google OAuth 2.0, Credentials | Secure JWT sessions, PBKDF2 SHA-512 password hashing |
| **State & Data** | TanStack React Query, Sonner | Optimistic mutations, real-time toast notifications, cache management |
| **Deployment** | Vercel (Frontend), Render (Backend), Docker | Automated continuous integration and containerized hosting |

---

## Installation

### Prerequisites
* **Node.js**: `v20.x` or `v22.x`
* **Python**: `3.10` or higher
* **Package Managers**: `npm` and `pip`
* **API Keys**: [Google AI Studio (Gemini)](https://aistudio.google.com) and [Pinecone](https://app.pinecone.io)

---

### Step 1: Clone Repository
```bash
git clone https://github.com/Pradeepks01/PDF-AI.git
cd PDF-AI
```

---

### Step 2: Configure Environment Variables

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
NEXTAUTH_SECRET=your_nextauth_secret_key_minimum_32_characters
NEXTAUTH_URL=http://localhost:3000
GOOGLE_CLIENT_ID=your_google_oauth_client_id
GOOGLE_CLIENT_SECRET=your_google_oauth_client_secret
DATABASE_URL=file:./dev.db
```

---

### Step 3: Run Python FastAPI Backend

1. Navigate to the backend directory:
   ```bash
   cd python_backend
   ```
2. Create and activate a virtual environment:
   ```bash
   # Windows
   python -m venv venv
   .\venv\Scripts\activate

   # macOS / Linux
   python3 -m venv venv
   source venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Start the development server:
   ```bash
   python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
   ```
   The backend API will be available at `http://127.0.0.1:8000` (Interactive Swagger Docs: `http://127.0.0.1:8000/docs`).

---

### Step 4: Run Next.js Frontend

1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Generate Prisma client:
   ```bash
   npx prisma generate
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```
   The application will be accessible at `http://localhost:3000`.

---

## Deployment

### Frontend Deployment (Vercel)

1. Import the repository into [Vercel](https://vercel.com).
2. Set the **Root Directory** to `frontend`.
3. Configure the build settings:
   * **Framework Preset**: Next.js
   * **Build Command**: `prisma generate && next build`
   * **Output Directory**: `.next`
4. Add the production environment variables in the Vercel dashboard:
   * `NEXT_PUBLIC_API_URL` (URL of the deployed FastAPI backend, e.g., `https://pdf-ai-xckr.onrender.com`)
   * `NEXTAUTH_URL` (Production frontend URL, e.g., `https://pdf-ai-puce.vercel.app`)
   * `NEXTAUTH_SECRET`
   * `GOOGLE_CLIENT_ID`
   * `GOOGLE_CLIENT_SECRET`
5. Click **Deploy**.

---

### Backend Deployment (Render / Cloud Container)

1. Create a new **Web Service** on [Render](https://render.com) linked to the repository.
2. Set the **Root Directory** to `python_backend`.
3. Configure runtime settings:
   * **Environment**: Python 3
   * **Build Command**: `pip install -r requirements.txt`
   * **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
4. Add environment variables:
   * `PINECONE_API_KEY`
   * `PINECONE_INDEX_NAME`
   * `GEMINI_API_KEY`
   * `PYTHON_VERSION` = `3.11.0`
5. Deploy the service and note the public URL.

---

### Docker Deployment

Run the complete stack locally using Docker Compose:

```bash
docker-compose up --build
```

To run in detached mode:
```bash
docker-compose up -d --build
```

---

## API Reference

### Backend Endpoints (`http://127.0.0.1:8000`)

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Verifies service health, active vector database, and primary LLM status. |
| `POST` | `/api/upload` | Ingests PDF documents, extracts text, generates 768-dim embeddings, and upserts vectors into Pinecone. |
| `POST` | `/api/web/crawl` | Crawls target URL, extracts markdown, embeds text chunks, and indexes into Pinecone. |
| `POST` | `/api/chat` | Executes the 6-stage retrieval pipeline and returns a grounded answer with citations. |
| `POST` | `/api/chat/stream` | Streams AI response tokens in real-time via Server-Sent Events (SSE). |
| `DELETE` | `/api/namespace/{ns}` | Purges all indexed vector embeddings within the specified namespace. |

### Frontend Auth Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/auth/[...nextauth]` | Handles Google OAuth and Credentials session management. |
| `POST` | `/api/auth/reset-password` | Resets user password using PBKDF2 SHA-512 salted hashing. |
| `GET` | `/api/python-health` | Server-side proxy check for Python backend availability. |

---

## License

This project is licensed under the MIT License.
