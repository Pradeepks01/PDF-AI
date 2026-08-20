import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Providers } from "@/lib/react-query";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  metadataBase: new URL("https://pdf-ai-puce.vercel.app"),
  title: "PDF AI RAG Studio — Chat with your PDFs & web like never before",
  description:
    "SOTA 6-stage Retrieval-Augmented Generation studio powered by Pinecone 768-dim vector search and Google Gemini 2.5 Flash for millisecond retrieval across documents and live web pages.",
  keywords: [
    "PDF AI",
    "RAG",
    "Retrieval-Augmented Generation",
    "Pinecone",
    "Google Gemini",
    "Vector Search",
    "Semantic Search",
    "Document Q&A",
    "Web Crawler RAG",
  ],
  authors: [{ name: "PDF AI RAG Studio Team" }],
  creator: "PDF AI RAG Studio",
  alternates: {
    canonical: "https://pdf-ai-puce.vercel.app",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://pdf-ai-puce.vercel.app",
    title: "PDF AI RAG Studio — Chat with your PDFs & web like never before",
    description:
      "Transform PDFs and web pages into high-precision vector coordinates with Pinecone & Google Gemini. 100% private with Bring Your Own Keys (BYOK).",
    siteName: "PDF AI RAG Studio",
  },
  twitter: {
    card: "summary_large_image",
    title: "PDF AI RAG Studio — Chat with your PDFs & web like never before",
    description:
      "SOTA 6-stage RAG studio with Pinecone vector database and Google Gemini 2.5 Flash.",
    creator: "@pdf_ai_rag",
  },
  robots: {
    index: true,
    follow: true,
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "PDF AI RAG Studio",
  "operatingSystem": "All modern browsers (Web)",
  "applicationCategory": "BusinessApplication, ProductivityApplication",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD"
  },
  "description": "A state-of-the-art Retrieval-Augmented Generation (RAG) platform that enables interactive querying over multi-PDF collections and crawled web URLs using Pinecone vector database and Google Gemini 2.5 Flash.",
  "url": "https://pdf-ai-puce.vercel.app",
  "featureList": [
    "Multi-PDF vector search",
    "Real-time web page crawler",
    "6-stage hybrid dense + sparse RRF search",
    "Bring Your Own Keys (BYOK) localStorage vault",
    "Voice-to-text dictation",
    "Markdown session export"
  ]
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&family=JetBrains+Mono:ital,wght@0,100..800;1,100..800&family=Space+Grotesk:wght@300..700&display=swap"
          rel="stylesheet"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        suppressHydrationWarning
        className="font-sans antialiased bg-background text-foreground selection:bg-primary/25 selection:text-foreground min-h-screen"
      >
        <Providers>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem={false}
            disableTransitionOnChange
          >
            {children}
            <Toaster richColors position="top-right" />
          </ThemeProvider>
        </Providers>
      </body>
    </html>
  );
}
