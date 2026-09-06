import re
import math
from typing import List, Dict, Any

class RAGEvaluationService:
    """Evaluates RAG Triad metrics: Faithfulness, Answer Relevance, and Context Precision."""

    def compute_faithfulness(self, response: str, context_chunks: List[Dict[str, Any]]) -> float:
        """Measure what fraction of key factual statements in the response are grounded in the context."""
        if not response or not response.strip():
            return 0.0

        if not context_chunks:
            # If model correctly recognized that context is missing
            if "does not specify" in response.lower() or "not contain" in response.lower() or "no information" in response.lower():
                return 1.0
            return 0.2

        combined_context = " ".join(
            doc.get("metadata", {}).get("text", "") for doc in context_chunks
        ).lower()

        # Split response into individual sentences/claims
        sentences = [s.strip() for s in re.split(r'[.!?\n]', response) if len(s.strip()) > 10]
        if not sentences:
            return 1.0

        supported_sentences = 0
        stop_words = {
            "the", "and", "that", "this", "with", "from", "have", "for", "are", "was",
            "were", "will", "would", "could", "should", "their", "there", "about",
            "according", "document", "provided", "based", "section"
        }

        for sent in sentences:
            words = [w for w in re.findall(r'\b[a-zA-Z0-9_-]{3,}\b', sent.lower()) if w not in stop_words]
            if not words:
                supported_sentences += 1
                continue

            matches = sum(1 for w in words if w in combined_context)
            match_ratio = matches / len(words)
            if match_ratio >= 0.40:
                supported_sentences += 1

        score = supported_sentences / len(sentences)
        return min(max(round(score, 2), 0.0), 1.0)

    def compute_answer_relevance(self, query: str, response: str) -> float:
        """Measure how directly and effectively the response addresses the prompt."""
        if not query or not response:
            return 0.0

        raw_query_terms = set(re.findall(r'\b[a-zA-Z0-9_-]{3,}\b', query.lower()))
        response_lower = response.lower()

        if not raw_query_terms:
            return 0.90

        stop_query_words = {
            "what", "when", "where", "which", "who", "whom", "whose", "why", "how",
            "is", "are", "was", "were", "the", "and", "for", "with", "tell", "explain",
            "describe", "give", "show", "can", "you", "please", "about"
        }
        domain_query_terms = {t for t in raw_query_terms if t not in stop_query_words}
        query_terms = domain_query_terms or raw_query_terms

        # Term overlap
        matched_terms = sum(1 for term in query_terms if term in response_lower)
        overlap_score = matched_terms / len(query_terms)

        # Length / completeness factor
        length_factor = min(len(response.split()) / 15.0, 1.0)
        relevance = (overlap_score * 0.8) + (length_factor * 0.2)

        # If answer says not found, but it directly answers
        if "does not specify" in response_lower and overlap_score >= 0.3:
            relevance = max(relevance, 0.88)

        return min(max(round(relevance, 2), 0.0), 1.0)

    def compute_context_precision(self, query: str, context_chunks: List[Dict[str, Any]]) -> float:
        """Measure the signal-to-noise ratio of the retrieved and spotlighted document chunks."""
        if not context_chunks:
            return 0.0

        query_terms = [w for w in re.findall(r'\b[a-zA-Z0-9_-]{3,}\b', query.lower()) if len(w) > 2]
        if not query_terms:
            return 0.85

        relevant_chunk_count = 0
        total_chunks = len(context_chunks)

        for doc in context_chunks:
            text = doc.get("metadata", {}).get("text", "").lower()
            crag_grade = doc.get("crag_grade", "")
            
            if crag_grade == "CORRECT":
                relevant_chunk_count += 1
                continue

            matches = sum(1 for q in query_terms if q in text)
            if matches >= 1:
                relevant_chunk_count += 1

        precision = (relevant_chunk_count / total_chunks) if total_chunks > 0 else 0.0
        # Boost based on top-ranked match scores
        top_score = context_chunks[0].get("score", 0.8)
        combined = (precision * 0.6) + (min(top_score, 1.0) * 0.4)
        return min(max(round(combined, 2), 0.0), 1.0)

    def evaluate(
        self,
        query: str,
        response: str,
        context_chunks: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """Compute the complete RAG Triad Evaluation payload."""
        faithfulness = self.compute_faithfulness(response, context_chunks)
        relevance = self.compute_answer_relevance(query, response)
        precision = self.compute_context_precision(query, context_chunks)

        # Weighted overall composite RAG score
        overall = round((faithfulness * 0.4) + (relevance * 0.35) + (precision * 0.25), 2)

        return {
            "faithfulness": faithfulness,
            "answer_relevance": relevance,
            "context_precision": precision,
            "overall_score": overall,
            "grade": "EXCELLENT" if overall >= 0.85 else "GOOD" if overall >= 0.70 else "NEEDS_REVIEW",
            "eval_method": "RAG_TRIAD_HEURISTIC_V1"
        }
