import sys
import io

# Reconfigure stdout/stderr for Windows UTF-8 encoding compatibility
if hasattr(sys.stdout, 'buffer'):
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
if hasattr(sys.stderr, 'buffer'):
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Query, Header
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, JSONResponse
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
import uvicorn
import traceback
import time

from config import settings
from services.document_processor import DocumentProcessor
from services.ai_service import AIService
from services.pinecone_service import PineconeService
from services.guardrails_service import GuardrailsService
from services.evaluation_service import RAGEvaluationService

app = FastAPI(
    title="PDF & Web RAG API",
    description="Python FastAPI backend for RAG with Guardrails & Triad Evaluation",
    version="1.1.0"
)

# Enable full open CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Services
doc_processor = DocumentProcessor()
ai_service = AIService()
pinecone_service = PineconeService()
guardrails_service = GuardrailsService()
evaluation_service = RAGEvaluationService()

# Request Models
class WebCrawlRequest(BaseModel):
    url: str
    url_id: str

class ChatQueryRequest(BaseModel):
    query: str
    collection_id: str
    top_k: Optional[int] = 3

class WebChatQueryRequest(BaseModel):
    query: str
    url_id: str
    top_k: Optional[int] = 3

class BenchmarkEvaluationRequest(BaseModel):
    query: str
    response: str
    contexts: List[Dict[str, Any]]


@app.get("/")
def root():
    return {
        "message": "Welcome to the PDF & Web RAG API",
        "docs": "http://localhost:8000/docs",
        "health": "http://localhost:8000/api/health",
        "features": ["SOTA 6-Stage RAG", "Input/Output Guardrails", "RAG Triad Evaluation"]
    }


@app.get("/api/health")
def health_check():
    return {
        "status": "online",
        "service": "Python Pinecone RAG Backend",
        "vector_db": "Pinecone",
        "llm": "Google Gemini 2.5 Flash",
        "guardrails": "Active (Jailbreak & Hallucination Defense)",
        "evaluation": "Active (Faithfulness, Relevance, Precision)"
    }


def resolve_namespace(cid: str) -> str:
    if cid.startswith(("col-", "web-")):
        return cid
    elif cid.startswith("url_"):
        return f"web-{cid}"
    return f"col-{cid}"


@app.post("/api/upload")
async def upload_pdf(
    files: Optional[List[UploadFile]] = File(None),
    file: Optional[UploadFile] = File(None),
    collection_id: str = Form(...),
    x_gemini_api_key: Optional[str] = Header(None, alias="x-gemini-api-key"),
    x_pinecone_api_key: Optional[str] = Header(None, alias="x-pinecone-api-key")
):
    """Upload single or multiple PDFs, parse text, split chunks, embed, and upsert to Pinecone."""
    upload_list: List[UploadFile] = []
    if files:
        upload_list.extend(files)
    if file:
        upload_list.append(file)

    if not upload_list:
        raise HTTPException(status_code=400, detail="No PDF files provided in upload request.")

    namespace = resolve_namespace(collection_id)
    results = []
    total_vectors = 0

    for upload_item in upload_list:
        if not upload_item.filename.lower().endswith(".pdf"):
            results.append({
                "filename": upload_item.filename,
                "status": "error",
                "detail": "Only PDF files are supported."
            })
            continue

        try:
            content = await upload_item.read()
            chunks = doc_processor.process_pdf(content, upload_item.filename)

            if not chunks:
                results.append({
                    "filename": upload_item.filename,
                    "status": "error",
                    "detail": "Could not extract readable text from PDF."
                })
                continue

            vector_count = pinecone_service.upsert_chunks(
                namespace=namespace,
                chunks_with_metadata=chunks,
                ai_service=ai_service,
                custom_gemini_key=x_gemini_api_key,
                custom_pinecone_key=x_pinecone_api_key
            )
            total_vectors += vector_count

            results.append({
                "filename": upload_item.filename,
                "status": "success",
                "collection_id": collection_id,
                "namespace": namespace,
                "chunks_count": len(chunks),
                "vectors_upserted": vector_count
            })
        except Exception as e:
            print(f"[ERROR] Failed to process {upload_item.filename}: {e}")
            traceback.print_exc()
            results.append({
                "filename": upload_item.filename,
                "status": "error",
                "detail": str(e)
            })

    first_success = next((r for r in results if r.get("status") == "success"), results[0])

    return {
        "statusCode": 200,
        "message": f"Processed {len(upload_list)} PDF document(s)",
        "results": results,
        "data": first_success,
        "total_vectors_upserted": total_vectors
    }


@app.post("/api/web/crawl")
async def crawl_web_url(
    payload: WebCrawlRequest,
    x_gemini_api_key: Optional[str] = Header(None, alias="x-gemini-api-key"),
    x_pinecone_api_key: Optional[str] = Header(None, alias="x-pinecone-api-key")
):
    """Scrape website, clean markdown text, split chunks, embed, and upsert to Pinecone."""
    try:
        chunks = doc_processor.process_web_url(payload.url)

        if not chunks:
            raise HTTPException(status_code=400, detail=f"Could not extract clean text from URL: {payload.url}")

        namespace = f"web-{payload.url_id}"
        vector_count = pinecone_service.upsert_chunks(
            namespace=namespace,
            chunks_with_metadata=chunks,
            ai_service=ai_service,
            custom_gemini_key=x_gemini_api_key,
            custom_pinecone_key=x_pinecone_api_key
        )

        return {
            "statusCode": 200,
            "message": "Website crawled and vector indexed into Pinecone successfully",
            "data": {
                "url": payload.url,
                "url_id": payload.url_id,
                "namespace": namespace,
                "chunks_count": len(chunks),
                "vectors_upserted": vector_count
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"[ERROR] Crawl Exception: {e}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


def run_sota_retrieval(
    query: str, 
    namespace: str, 
    top_k: int = 3, 
    custom_gemini_key: str = None, 
    custom_pinecone_key: str = None
) -> List[dict]:
    """Execute SOTA RAG Pipeline: HyDE -> Hybrid Dense/Sparse -> RRF (k=60) -> Cross-Encoder -> CRAG Grader."""
    try:
        # 1. Dense Vector Retrieval on user query
        query_emb = ai_service.generate_embedding(query, custom_api_key=custom_gemini_key)
        dense_matches = pinecone_service.query_similarity(
            namespace=namespace,
            query_embedding=query_emb,
            top_k=max(top_k * 3, 8),
            custom_pinecone_key=custom_pinecone_key
        ) or []

        # 2. HyDE (Hypothetical Document Embeddings) Retrieval
        try:
            hyde_doc = ai_service.generate_hyde_document(query, custom_api_key=custom_gemini_key)
            hyde_emb = ai_service.generate_embedding(hyde_doc, custom_api_key=custom_gemini_key)
            hyde_matches = pinecone_service.query_similarity(
                namespace=namespace,
                query_embedding=hyde_emb,
                top_k=max(top_k * 3, 8),
                custom_pinecone_key=custom_pinecone_key
            ) or []
        except Exception:
            hyde_matches = []

        # If no vectors found in namespace at all, return empty list
        if not dense_matches and not hyde_matches:
            return []

        # 3. Sparse BM25 Lexical Ranking over candidate pool
        candidate_pool = {m["id"]: m for m in (dense_matches + hyde_matches)}.values()
        sparse_matches = ai_service.compute_sparse_bm25_ranking(query, list(candidate_pool))

        # 4. Reciprocal Rank Fusion (RRF with k = 60)
        fused_candidates = ai_service.apply_rrf([dense_matches, hyde_matches, sparse_matches], k=60)

        # 5. Cross-Encoder Fine-Grained Re-ranking
        cross_ranked = ai_service.cross_encoder_rerank(
            query=query, 
            candidate_matches=fused_candidates, 
            top_k=max(top_k * 2, 5), 
            custom_api_key=custom_gemini_key
        )

        # 6. CRAG (Corrective RAG) Document Grader
        final_graded = ai_service.crag_grade_documents(
            query=query, 
            documents=cross_ranked, 
            custom_api_key=custom_gemini_key
        )

        return (final_graded or dense_matches)[:top_k]
    except Exception as err:
        print(f"[WARNING] SOTA retrieval fallback: {err}")
        return []


@app.post("/api/chat")
async def chat_pdf_rag(
    payload: ChatQueryRequest,
    x_gemini_api_key: Optional[str] = Header(None),
    x_pinecone_api_key: Optional[str] = Header(None)
):
    """SOTA RAG Chat query endpoint with Input/Output Guardrails and RAG Triad Evaluation."""
    start_time = time.time()
    try:
        # 1. Input Guardrails Audit
        input_guardrail = guardrails_service.validate_input(payload.query)
        if not input_guardrail["passed"]:
            return {
                "statusCode": 200,
                "message": "Guardrail Interception",
                "data": {
                    "response": f"🛡️ **Safety Guardrail Triggered**: {input_guardrail['reason']}. Please refine your query.",
                    "sources": [],
                    "guardrails": {
                        "input": input_guardrail,
                        "output": {"passed": False, "status": "BLOCKED_BY_INPUT_GUARDRAIL", "grounded": False}
                    },
                    "evaluation": {
                        "faithfulness": 1.0,
                        "answer_relevance": 0.0,
                        "context_precision": 0.0,
                        "overall_score": 0.0,
                        "grade": "GUARDRAIL_BLOCKED"
                    }
                }
            }

        # 2. SOTA Retrieval Pipeline
        namespace = resolve_namespace(payload.collection_id)
        final_context = run_sota_retrieval(
            query=payload.query,
            namespace=namespace,
            top_k=payload.top_k or 3,
            custom_gemini_key=x_gemini_api_key,
            custom_pinecone_key=x_pinecone_api_key
        )

        # 3. Grounded Synthesis
        raw_answer = ai_service.generate_rag_answer(
            query=payload.query,
            context_matches=final_context,
            custom_api_key=x_gemini_api_key
        )

        # 4. Output Guardrails Audit
        output_guardrail = guardrails_service.audit_output(raw_answer, final_context)
        sanitized_answer = output_guardrail.get("cleaned_text", raw_answer)

        # 5. RAG Triad Evaluation Metrics
        evaluation_metrics = evaluation_service.evaluate(
            query=payload.query,
            response=sanitized_answer,
            context_chunks=final_context
        )
        evaluation_metrics["latency_ms"] = round((time.time() - start_time) * 1000, 1)

        return {
            "statusCode": 200,
            "message": "Success",
            "data": {
                "response": sanitized_answer,
                "sources": final_context,
                "guardrails": {
                    "input": input_guardrail,
                    "output": output_guardrail
                },
                "evaluation": evaluation_metrics
            }
        }
    except Exception as e:
        print(f"[ERROR] Chat Exception: {e}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/chat/stream")
async def chat_pdf_rag_stream(
    query: str = Query(...),
    collection_id: str = Query(...),
    top_k: int = Query(3),
    x_gemini_api_key: Optional[str] = Header(None),
    x_pinecone_api_key: Optional[str] = Header(None)
):
    """Real-time Server-Sent Events (SSE) streaming endpoint with SOTA RAG Pipeline & Guardrails."""
    try:
        # Input Guardrail check
        input_guardrail = guardrails_service.validate_input(query)
        if not input_guardrail["passed"]:
            async def refusal_stream():
                yield f"data: 🛡️ **Safety Guardrail Triggered**: {input_guardrail['reason']}.\n\n"
            return StreamingResponse(refusal_stream(), media_type="text/event-stream")

        namespace = resolve_namespace(collection_id)
        final_context = run_sota_retrieval(
            query=query,
            namespace=namespace,
            top_k=top_k,
            custom_gemini_key=x_gemini_api_key,
            custom_pinecone_key=x_pinecone_api_key
        )

        generator = ai_service.generate_rag_answer_stream(
            query=query,
            context_matches=final_context,
            custom_api_key=x_gemini_api_key
        )
        return StreamingResponse(generator, media_type="text/event-stream")
    except Exception as e:
        print(f"[ERROR] Stream Exception: {e}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/eval/benchmark")
async def evaluate_benchmark(payload: BenchmarkEvaluationRequest):
    """Run standalone RAG Triad evaluation metrics on query, response, and document contexts."""
    try:
        guardrail_in = guardrails_service.validate_input(payload.query)
        guardrail_out = guardrails_service.audit_output(payload.response, payload.contexts)
        eval_result = evaluation_service.evaluate(payload.query, payload.response, payload.contexts)

        return {
            "statusCode": 200,
            "data": {
                "guardrails": {
                    "input": guardrail_in,
                    "output": guardrail_out
                },
                "evaluation": eval_result
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.delete("/api/namespace/{namespace}")
async def delete_namespace(
    namespace: str,
    x_pinecone_api_key: Optional[str] = Header(None)
):
    """Delete all vectors for a collection or web chat in Pinecone."""
    success = pinecone_service.delete_namespace(namespace, custom_pinecone_key=x_pinecone_api_key)
    if success:
        return {"statusCode": 200, "message": f"Namespace '{namespace}' deleted successfully"}
    raise HTTPException(status_code=500, detail=f"Failed to delete namespace '{namespace}'")


if __name__ == "__main__":
    uvicorn.run("main:app", host=settings.HOST, port=settings.PORT, reload=True)
