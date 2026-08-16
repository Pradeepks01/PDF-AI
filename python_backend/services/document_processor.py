import io
import requests
from typing import List, Dict, Any
from pypdf import PdfReader
import trafilatura
from bs4 import BeautifulSoup
from langchain_text_splitters import RecursiveCharacterTextSplitter

class DocumentProcessor:
    def __init__(self, chunk_size: int = 1000, chunk_overlap: int = 150):
        self.splitter = RecursiveCharacterTextSplitter(
            chunk_size=chunk_size,
            chunk_overlap=chunk_overlap,
            separators=["\n\n", "\n", " ", ""]
        )

    def process_pdf(self, pdf_bytes: bytes, filename: str) -> List[Dict[str, Any]]:
        """Extract text page-by-page from PDF and split into chunk payloads."""
        pdf_file = io.BytesIO(pdf_bytes)
        reader = PdfReader(pdf_file)
        chunks_with_metadata = []

        for page_idx, page in enumerate(reader.pages):
            page_text = page.extract_text()
            if not page_text or not page_text.strip():
                continue

            page_number = page_idx + 1
            chunks = self.splitter.split_text(page_text)

            for chunk in chunks:
                chunks_with_metadata.append({
                    "text": chunk,
                    "metadata": {
                        "filename": filename,
                        "page_number": page_number,
                        "source": "pdf"
                    }
                })

        return chunks_with_metadata

    def process_web_url(self, url: str) -> List[Dict[str, Any]]:
        """Scrape web page, extract clean text, and split into chunks."""
        extracted_text = None

        # 1. Try trafilatura fetch
        try:
            downloaded = trafilatura.fetch_url(url)
            if downloaded:
                extracted_text = trafilatura.extract(downloaded, include_links=True, include_images=False)
        except Exception:
            extracted_text = None

        # 2. Fallback to requests with browser User-Agent
        if not extracted_text:
            try:
                headers = {
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
                }
                resp = requests.get(url, headers=headers, timeout=12)
                resp.raise_for_status()
                
                # Attempt trafilatura parse on HTML
                extracted_text = trafilatura.extract(resp.text)
                if not extracted_text:
                    # Fallback to BeautifulSoup
                    soup = BeautifulSoup(resp.text, "html.parser")
                    for s in soup(["script", "style", "nav", "footer"]):
                        s.extract()
                    extracted_text = soup.get_text(separator="\n", strip=True)
            except Exception as req_err:
                print(f"[WARN] Web fetch failed for {url}: {req_err}")

        if not extracted_text or not extracted_text.strip():
            raise ValueError(f"Could not extract readable text from URL: {url}")

        chunks = self.splitter.split_text(extracted_text)
        chunks_with_metadata = []

        for idx, chunk in enumerate(chunks):
            chunks_with_metadata.append({
                "text": chunk,
                "metadata": {
                    "source_url": url,
                    "chunk_index": idx,
                    "source": "web"
                }
            })

        return chunks_with_metadata
