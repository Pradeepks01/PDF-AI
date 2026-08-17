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
        cleaned_url = url.strip()
        if not cleaned_url.startswith(("http://", "https://")):
            cleaned_url = f"https://{cleaned_url}"

        extracted_text = None

        # 1. Try trafilatura fetch
        try:
            downloaded = trafilatura.fetch_url(cleaned_url)
            if downloaded:
                extracted_text = trafilatura.extract(downloaded, include_links=True, include_images=False)
        except Exception as tf_err:
            print(f"[WARN] Trafilatura fetch error for {cleaned_url}: {tf_err}")
            extracted_text = None

        # 2. Fallback to requests with browser User-Agent
        if not extracted_text:
            try:
                headers = {
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
                    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
                    "Accept-Language": "en-US,en;q=0.5",
                }
                resp = requests.get(cleaned_url, headers=headers, timeout=15, verify=False)
                if resp.status_code == 200 and resp.text:
                    # Attempt trafilatura parse on HTML
                    extracted_text = trafilatura.extract(resp.text)
                    if not extracted_text:
                        # Fallback to BeautifulSoup
                        soup = BeautifulSoup(resp.text, "html.parser")
                        for s in soup(["script", "style", "nav", "footer", "header", "aside", "noscript", "svg"]):
                            s.extract()
                        extracted_text = soup.get_text(separator="\n", strip=True)
            except Exception as req_err:
                print(f"[WARN] Requests fetch failed for {cleaned_url}: {req_err}")

        if not extracted_text or not extracted_text.strip():
            raise ValueError(f"Could not extract readable text from URL: {cleaned_url}. The page might require login or JavaScript rendering.")

        chunks = self.splitter.split_text(extracted_text)
        chunks_with_metadata = []

        for idx, chunk in enumerate(chunks):
            chunks_with_metadata.append({
                "text": chunk,
                "metadata": {
                    "source_url": cleaned_url,
                    "chunk_index": idx,
                    "source": "web"
                }
            })

        return chunks_with_metadata
