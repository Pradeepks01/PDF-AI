from typing import List, Dict, Any
from pinecone import Pinecone, ServerlessSpec
from config import settings
import traceback

from fastapi import HTTPException

class PineconeService:
    def __init__(self):
        self._pc = None
        self._index = None

    def _get_index(self, custom_api_key: str = None):
        api_key = custom_api_key.strip() if (custom_api_key and custom_api_key.strip()) else settings.PINECONE_API_KEY
        if not api_key:
            raise HTTPException(status_code=400, detail="Pinecone API Key is missing. Please enter your Pinecone API Key (pcsk_...) in Settings or the API Vault.")

        if self._index and not custom_api_key:
            return self._index

        pc = Pinecone(api_key=api_key)
        index_name = settings.PINECONE_INDEX_NAME

        try:
            if not pc.has_index(index_name):
                print(f"[INFO] Index '{index_name}' not found. Creating serverless Pinecone index...")
                pc.create_index(
                    name=index_name,
                    dimension=768,  # Match text-embedding-004 / gemini-embedding-001
                    metric="cosine",
                    spec=ServerlessSpec(cloud="aws", region="us-east-1")
                )
                print(f"[SUCCESS] Created Pinecone index '{index_name}'")
        except Exception as err:
            print(f"[WARNING] Warning checking/creating index '{index_name}': {err}")

        index = pc.Index(index_name)
        if not custom_api_key:
            self._index = index
        return index

    def upsert_chunks(
        self,
        namespace: str,
        chunks_with_metadata: List[Dict[str, Any]],
        ai_service,
        custom_gemini_key: str = None,
        custom_pinecone_key: str = None
    ) -> int:
        """Embed text chunks in high-throughput batches and upsert vectors into Pinecone."""
        try:
            index = self._get_index(custom_pinecone_key)
            texts = [item["text"] for item in chunks_with_metadata]

            # High-throughput batch vectorization
            embeddings = ai_service.generate_embeddings_batch(texts, custom_api_key=custom_gemini_key)

            vectors_to_upsert = []
            for idx, item in enumerate(chunks_with_metadata):
                text = item["text"]
                metadata = item["metadata"]
                metadata["text"] = text

                embedding = embeddings[idx] if idx < len(embeddings) else ai_service.generate_embedding(text, custom_gemini_key)
                vector_id = f"{namespace}_{idx}_{hash(text) & 0xffffffff}"

                vectors_to_upsert.append({
                    "id": vector_id,
                    "values": embedding,
                    "metadata": metadata
                })

            # Batch upsert in sizes of 100 vectors
            batch_size = 100
            for i in range(0, len(vectors_to_upsert), batch_size):
                batch = vectors_to_upsert[i:i + batch_size]
                index.upsert(vectors=batch, namespace=namespace)

            print(f"[SUCCESS] Upserted {len(vectors_to_upsert)} vectors to Pinecone namespace '{namespace}'")
            return len(vectors_to_upsert)
        except Exception as e:
            print(f"[ERROR] Error in Pinecone upsert_chunks: {e}")
            traceback.print_exc()
            raise e

    def query_similarity(
        self,
        namespace: str,
        query_embedding: List[float],
        top_k: int = 5,
        custom_pinecone_key: str = None
    ) -> List[Dict[str, Any]]:
        """Query Pinecone for top_k similar vectors in a specific namespace."""
        try:
            index = self._get_index(custom_pinecone_key)
            results = index.query(
                namespace=namespace,
                vector=query_embedding,
                top_k=top_k,
                include_metadata=True
            )

            matches = []
            for match in results.get("matches", []):
                matches.append({
                    "id": match.get("id"),
                    "score": match.get("score"),
                    "metadata": match.get("metadata", {})
                })

            return matches
        except Exception as e:
            print(f"[ERROR] Error in Pinecone query_similarity: {e}")
            traceback.print_exc()
            return []

    def delete_namespace(self, namespace: str, custom_pinecone_key: str = None) -> bool:
        """Delete all vectors in a given Pinecone namespace."""
        try:
            index = self._get_index(custom_pinecone_key)
            index.delete(delete_all=True, namespace=namespace)
            print(f"[SUCCESS] Deleted Pinecone namespace '{namespace}'")
            return True
        except Exception as e:
            print(f"[WARNING] Error deleting Pinecone namespace '{namespace}': {e}")
            return False
