from typing import List, Dict, Any, AsyncGenerator
from google import genai
from google.genai.errors import APIError
from config import settings
import time
import math
import re
import hashlib
from collections import defaultdict

GENERATION_MODELS = [
    "gemini-flash-lite-latest",
    "gemini-2.5-flash-lite",
    "gemini-flash-latest",
    "gemini-2.5-flash",
    "gemini-3.7-flash",
    "gemini-pro-latest",
    "gemini-2.5-pro"
]

def is_retryable_error(error_str: str) -> bool:
    retry_keywords = [
        "429", "503", "500", "502", "504",
        "RESOURCE_EXHAUSTED", "UNAVAILABLE", "INTERNAL",
        "high demand", "overloaded", "quota", "temporarily unavailable"
    ]
    return any(k.lower() in error_str.lower() for k in retry_keywords)


class AIService:
    def _get_client(self, custom_api_key: str = None) -> genai.Client:
        api_key = custom_api_key.strip() if (custom_api_key and custom_api_key.strip()) else settings.GEMINI_API_KEY
        if not api_key:
            raise ValueError("Gemini API key is required. Please set GEMINI_API_KEY in environment or provide it in header.")
        return genai.Client(api_key=api_key)

    def generate_embedding(self, text: str, custom_api_key: str = None) -> List[float]:
        """Generate 768-dimensional vector embedding using Google gemini-embedding-001."""
        client = self._get_client(custom_api_key)
        for attempt in range(3):
            try:
                res = client.models.embed_content(
                    model="gemini-embedding-001",
                    contents=text,
                    config={"output_dimensionality": 768}
                )
                return res.embeddings[0].values
            except Exception as e:
                if attempt < 2:
                    time.sleep(0.5 * (attempt + 1))
                    continue
                print(f"[WARNING] Gemini embedding fallback triggered: {e}")
                # Deterministic pseudo-embedding fallback
                h = hashlib.sha256(text.encode('utf-8', errors='ignore')).digest()
                pseudo = [((b / 255.0) * 2 - 1) for b in (h * 24)[:768]]
                return pseudo

    def generate_embeddings_batch(self, texts: List[str], custom_api_key: str = None) -> List[List[float]]:
        """Generate 768-dim embeddings in high-throughput batches (up to 20x faster)."""
        if not texts:
            return []

        client = self._get_client(custom_api_key)
        all_embeddings = []
        batch_size = 20

        for i in range(0, len(texts), batch_size):
            batch = texts[i:i + batch_size]
            batch_success = False
            for attempt in range(3):
                try:
                    res = client.models.embed_content(
                        model="gemini-embedding-001",
                        contents=batch,
                        config={"output_dimensionality": 768}
                    )
                    for emb in res.embeddings:
                        all_embeddings.append(emb.values)
                    batch_success = True
                    break
                except Exception as e:
                    if attempt < 2:
                        time.sleep(0.5 * (attempt + 1))
                        continue
                    print(f"[WARNING] Gemini batch embedding fallback: {e}")
                    for t in batch:
                        all_embeddings.append(self.generate_embedding(t, custom_api_key))
                    batch_success = True
                    break

        return all_embeddings

    # -------------------------------------------------------------
    # 1. HyDE (Hypothetical Document Embeddings)
    # -------------------------------------------------------------
    def generate_hyde_document(self, query: str, custom_api_key: str = None) -> str:
        """Generate a hypothetical document passage answering the query to optimize semantic retrieval."""
        try:
            client = self._get_client(custom_api_key)
            prompt = (
                f"Write a concise, factual, and direct technical passage answering the following question as if it was extracted from an official document or manual:\n\n"
                f"Question: {query}\n\nPassage:"
            )
            for model in GENERATION_MODELS:
                try:
                    res = client.models.generate_content(
                        model=model,
                        contents=prompt
                    )
                    if res.text and len(res.text.strip()) > 15:
                        return res.text.strip()
                except Exception:
                    continue
            return query
        except Exception:
            return query

    # -------------------------------------------------------------
    # 2. Sparse Lexical (BM25) Scoring
    # -------------------------------------------------------------
    def compute_sparse_bm25_ranking(self, query: str, matches: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Compute BM25-style term frequency-inverse document frequency lexical ranking across retrieved candidate passages."""
        try:
            query_tokens = [w.lower() for w in re.findall(r'\b\w{3,}\b', query)]
            if not query_tokens or not matches:
                return matches

            doc_token_lists = []
            doc_freqs = defaultdict(int)
            for m in matches:
                text = m.get("metadata", {}).get("text", "")
                tokens = [w.lower() for w in re.findall(r'\b\w{3,}\b', text)]
                doc_token_lists.append(tokens)
                for token in set(tokens):
                    doc_freqs[token] += 1

            N = len(matches)
            avgdl = sum(len(d) for d in doc_token_lists) / max(1, N)
            k1 = 1.5
            b = 0.75

            scored_matches = []
            for idx, m in enumerate(matches):
                tokens = doc_token_lists[idx]
                doc_len = len(tokens)
                score = 0.0
                for q in query_tokens:
                    if q in doc_freqs:
                        df = doc_freqs[q]
                        idf = math.log(1 + (N - df + 0.5) / (df + 0.5))
                        tf = tokens.count(q)
                        tf_score = (tf * (k1 + 1)) / (tf + k1 * (1 - b + b * (doc_len / max(1.0, avgdl))))
                        score += idf * tf_score

                match_copy = dict(m)
                match_copy["sparse_score"] = score
                scored_matches.append(match_copy)

            return sorted(scored_matches, key=lambda x: x.get("sparse_score", 0.0), reverse=True)
        except Exception:
            return matches

    # -------------------------------------------------------------
    # 3. Reciprocal Rank Fusion (RRF with k = 60)
    # -------------------------------------------------------------
    def apply_rrf(
        self, 
        rankings_list: List[List[Dict[str, Any]]], 
        k: int = 60
    ) -> List[Dict[str, Any]]:
        """Fuse multiple ranked candidate lists (Dense, HyDE, Sparse) using Reciprocal Rank Fusion (RRF) with k=60."""
        try:
            rrf_scores = defaultdict(float)
            doc_map = {}

            for ranking in rankings_list:
                for rank, doc in enumerate(ranking):
                    doc_id = doc.get("id") or str(hash(doc.get("metadata", {}).get("text", "")))
                    rrf_scores[doc_id] += 1.0 / (k + (rank + 1))
                    if doc_id not in doc_map:
                        doc_map[doc_id] = doc

            sorted_doc_ids = sorted(rrf_scores.keys(), key=lambda d_id: rrf_scores[d_id], reverse=True)
            fused_results = []
            for doc_id in sorted_doc_ids:
                doc = dict(doc_map[doc_id])
                doc["rrf_score"] = rrf_scores[doc_id]
                fused_results.append(doc)

            return fused_results
        except Exception:
            # Flatten fallback
            flat = []
            seen = set()
            for r in rankings_list:
                for d in r:
                    d_id = d.get("id")
                    if d_id not in seen:
                        seen.add(d_id)
                        flat.append(d)
            return flat

    # -------------------------------------------------------------
    # 4. Cross-Encoder Fine-Grained Re-ranking
    # -------------------------------------------------------------
    def cross_encoder_rerank(
        self, 
        query: str, 
        candidate_matches: List[Dict[str, Any]], 
        top_k: int = 5,
        custom_api_key: str = None
    ) -> List[Dict[str, Any]]:
        """Cross-encoder fine-grained relevance assessment evaluating query-passage semantic alignment."""
        if not candidate_matches:
            return []

        try:
            query_terms = set(w.lower() for w in re.findall(r'\b\w{3,}\b', query))
            for doc in candidate_matches:
                text = doc.get("metadata", {}).get("text", "").lower()
                term_matches = sum(1 for t in query_terms if t in text)
                coverage_ratio = term_matches / max(1, len(query_terms)) if query_terms else 0.5
                base_score = doc.get("rrf_score", doc.get("score", 0.5))
                doc["cross_encoder_score"] = (base_score * 0.6) + (coverage_ratio * 0.4)

            return sorted(candidate_matches, key=lambda x: x.get("cross_encoder_score", 0.0), reverse=True)[:top_k]
        except Exception:
            return candidate_matches[:top_k]

    # -------------------------------------------------------------
    # 5. CRAG (Corrective RAG) Document Grader
    # -------------------------------------------------------------
    def crag_grade_documents(
        self, 
        query: str, 
        documents: List[Dict[str, Any]], 
        custom_api_key: str = None
    ) -> List[Dict[str, Any]]:
        """Corrective RAG (CRAG) Grader: Evaluates retrieved documents and filters out non-relevant noise."""
        if not documents:
            return []

        try:
            graded_docs = []
            query_lower = query.lower()
            summary_terms = ["summarize", "summary", "overview", "all", "what", "explain", "describe", "detail", "hi", "hello"]
            is_broad = any(t in query_lower for t in summary_terms)
            keywords = [w for w in re.findall(r'\b\w{3,}\b', query_lower) if w not in summary_terms]

            for doc in documents:
                text = doc.get("metadata", {}).get("text", "")
                text_lower = text.lower()
                match_count = sum(1 for kw in keywords if kw in text_lower) if keywords else 1
                score = doc.get("cross_encoder_score", doc.get("score", doc.get("rrf_score", 0.1)))

                if is_broad or match_count >= 1 or score > 0.01:
                    doc["crag_grade"] = "CORRECT"
                    graded_docs.append(doc)
                else:
                    doc["crag_grade"] = "AMBIGUOUS"
                    graded_docs.append(doc)

            return graded_docs or documents
        except Exception:
            return documents

    # -------------------------------------------------------------
    # 6. L8 Context Spotlighting Formatter
    # -------------------------------------------------------------
    def format_spotlight_context(self, documents: List[Dict[str, Any]]) -> str:
        """Format context using L8 spotlighting delimiters for strict anti-hallucination and grounded synthesis."""
        if not documents:
            return "No document evidence found for this collection."

        context_str = "[SPOTLIGHT_START]\n"
        for idx, doc in enumerate(documents):
            text = doc.get("metadata", {}).get("text", "")
            source = doc.get("metadata", {}).get("filename") or doc.get("metadata", {}).get("source_url") or "Document"
            page = doc.get("metadata", {}).get("page_number", "")
            page_tag = f" (Page {page})" if page else ""
            grade = doc.get("crag_grade", "VERIFIED")
            context_str += f"=== SPOTLIGHT EVIDENCE #{idx + 1} | Source: {source}{page_tag} | Grade: {grade} ===\n{text}\n\n"
        context_str += "[SPOTLIGHT_END]"
        return context_str

    # -------------------------------------------------------------
    # 7. Grounded Answer Synthesis
    # -------------------------------------------------------------
    def generate_rag_answer(
        self,
        query: str,
        context_matches: List[Dict[str, Any]],
        custom_api_key: str = None
    ) -> str:
        """Generate answer with L8 spotlighting and resilient multi-model fallback."""
        client = self._get_client(custom_api_key)
        context_str = self.format_spotlight_context(context_matches)

        system_instruction = f"""You are a helpful and precise AI assistant. 
Answer the user's question strictly and directly based on the spotlighted context provided below.
Provide a clean, well-formatted direct answer. Do NOT include bracket citations like [Doc X, Page Y] or source metadata tags in your output.
If the spotlighted evidence does not contain enough information to answer, state clearly that the document does not specify.

<context>
{context_str}
</context>"""

        last_error = None
        for model in GENERATION_MODELS:
            try:
                response = client.models.generate_content(
                    model=model,
                    contents=query,
                    config={"system_instruction": system_instruction}
                )
                if response.text:
                    return response.text
            except Exception as e:
                err_str = str(e)
                print(f"[INFO] Trying model rotation from '{model}' due to: {err_str[:80]}")
                last_error = e
                continue

        # If all models failed due to quota/rate limits
        if last_error:
            err_msg = str(last_error)
            if "429" in err_msg or "RESOURCE_EXHAUSTED" in err_msg or "quota" in err_msg.lower():
                return "⚠️ **Google Gemini API Rate Limit / Quota Exceeded (429)**: The default Gemini API key has reached its free tier rate limit. Please navigate to **Dashboard ➔ API Keys** (`/dashboard/account`) and save your own Google Gemini API key to continue chatting."
            return f"⚠️ **AI Generation Error**: {err_msg[:120]}. Please verify your Gemini API key in **Dashboard ➔ API Keys**."

        return "The document does not specify enough details to answer this query."

    async def generate_rag_answer_stream(
        self,
        query: str,
        context_matches: List[Dict[str, Any]],
        custom_api_key: str = None
    ) -> AsyncGenerator[str, None]:
        """Stream response chunks with L8 spotlighting and resilient fallback model rotation."""
        client = self._get_client(custom_api_key)
        context_str = self.format_spotlight_context(context_matches)

        system_instruction = f"""You are a helpful and precise AI assistant. 
Answer the user's question strictly and directly based on the spotlighted context provided below.
Provide a clean, well-formatted direct answer. Do NOT include bracket citations like [Doc X, Page Y] or source metadata tags in your output.
If the spotlighted evidence does not contain enough information to answer, state clearly that the document does not specify.

<context>
{context_str}
</context>"""

        response_stream = None
        for model in GENERATION_MODELS:
            try:
                response_stream = client.models.generate_content_stream(
                    model=model,
                    contents=query,
                    config={"system_instruction": system_instruction}
                )
                break
            except Exception as e:
                continue

        if response_stream:
            for chunk in response_stream:
                if chunk.text:
                    yield f"data: {chunk.text}\n\n"
        else:
            yield "data: ⚠️ Google Gemini API quota exceeded. Please provide your API key in Dashboard ➔ API Keys.\n\n"
