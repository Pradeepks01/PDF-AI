"use client";

import Link from "next/link";
import {
  Sparkles,
  ArrowRight,
  Zap,
  ShieldCheck,
  Layers,
  FileText,
  Globe,
  MessagesSquare,
  KeyRound,
  Mic,
  Download,
  Cpu,
  Database,
  CheckCircle2,
  Flame,
} from "lucide-react";
import { ModeToggle } from "@/components/ModeToggle";

export default function HomePage() {
  const featureCards = [
    {
      icon: FileText,
      badge: "High-Throughput",
      title: "Multi-PDF Vector Collections",
      description:
        "Upload research reports, financial audits, or contracts. Documents are parsed, split into optimal semantic chunks, and embedded in parallel batches into isolated Pinecone namespaces.",
      cta: "Open workspace",
      href: "/dashboard",
    },
    {
      icon: Globe,
      badge: "Live Ingestion",
      title: "Real-Time Web Crawler",
      description:
        "Point the crawler at any documentation URL or website. Content is scraped with BeautifulSoup & Trafilatura, converted to clean markdown, and vector indexed alongside your PDFs.",
      cta: "Open web crawler",
      href: "/dashboard/web-loader",
    },
    {
      icon: MessagesSquare,
      badge: "Zero Hallucination",
      title: "SOTA 6-Stage RAG Chat",
      description:
        "Queries trigger HyDE expansion, Hybrid Dense (768-dim) + Sparse BM25 scoring, Reciprocal Rank Fusion (k=60), Cross-Encoder re-ranking, and CRAG grading before Google Gemini answers.",
      cta: "Start research session",
      href: "/dashboard",
    },
    {
      icon: Mic,
      badge: "Hands-Free",
      title: "Voice-to-Text Dictation",
      description:
        "Speak your queries directly using native browser Web Speech API voice typing. Perfect for rapid research, complex technical questions, and hands-free document analysis.",
      cta: "Try voice typing",
      href: "/dashboard",
    },
    {
      icon: Download,
      badge: "Export & Share",
      title: "1-Click Markdown Export",
      description:
        "Download your entire grounded research session as a formatted Markdown (.md) document with complete timestamps, verbatim quotes, and inline source page citations.",
      cta: "Explore export tools",
      href: "/dashboard",
    },
    {
      icon: KeyRound,
      badge: "100% Private",
      title: "Bring Your Own Keys (BYOK)",
      description:
        "Connect your personal Pinecone (pcsk_...) and Google Gemini API keys. Keys reside strictly in your browser localStorage and are sent via request headers — never stored on external servers.",
      cta: "Manage API vault",
      href: "/dashboard/account",
    },
  ];

  const pipelineStages = [
    {
      num: "01",
      name: "HyDE Query Expansion",
      tag: "Semantic Alignment",
      icon: Sparkles,
      description:
        "Synthesizes an expert hypothetical passage for each query, eliminating vocabulary gaps between user questions and technical document phrasing.",
    },
    {
      num: "02",
      name: "Hybrid Dense + Sparse",
      tag: "768-Dim + BM25",
      icon: Database,
      description:
        "Queries Pinecone with 768-dim Google Gemini embeddings while simultaneously scoring candidate chunks with lexical BM25 token frequency.",
    },
    {
      num: "03",
      name: "RRF (k = 60) Rank Fusion",
      tag: "Reciprocal Ranking",
      icon: Layers,
      description:
        "Fuses Dense semantic coordinates, HyDE vectors, and Sparse lexical matches through Reciprocal Rank Fusion to extract the top candidate pool.",
    },
    {
      num: "04",
      name: "Cross-Encoder Re-Ranking",
      tag: "Fine Cross-Attention",
      icon: Cpu,
      description:
        "Performs deep token-level cross-attention relevance scoring across query-passage pairs to surface the highest quality evidence.",
    },
    {
      num: "05",
      name: "CRAG Document Grader",
      tag: "Noise Rejection",
      icon: ShieldCheck,
      description:
        "Classifies retrieved candidates as CORRECT, AMBIGUOUS, or INCORRECT — discarding irrelevant document noise before synthesis.",
    },
    {
      num: "06",
      name: "L8 Spotlight & Gemini Synthesis",
      tag: "Grounded Answer",
      icon: Flame,
      description:
        "Delimits verified evidence with structured spotlight boundaries and generates cited answers using Google Gemini with multi-model quota fallback.",
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground relative selection:bg-primary/25 selection:text-foreground">
      {/* ---------------- 1. AMBIENT BACKGROUND GLOWS ---------------- */}
      <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden" aria-hidden="true">
        <div className="absolute inset-0 grid-backdrop opacity-40" />

        <div
          className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[42rem] h-[42rem] rounded-full blur-[130px] opacity-20 pointer-events-none"
          style={{ background: "var(--primary)" }}
        />

        <div
          className="absolute top-[35%] right-[-10%] w-[30rem] h-[30rem] rounded-full blur-[100px] opacity-30 pointer-events-none"
          style={{ background: "var(--accent)" }}
        />

        <div
          className="absolute bottom-[10%] left-[-8%] w-[30rem] h-[30rem] rounded-full blur-[100px] opacity-10 pointer-events-none"
          style={{ background: "var(--primary)" }}
        />
      </div>

      {/* ---------------- 2. STICKY NAV HEADER ---------------- */}
      <header className="sticky top-0 z-50 h-16 backdrop-blur-xl bg-background/70 border-b border-border/60 transition-colors">
        <div className="max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="size-9 rounded-xl bg-primary text-primary-foreground flex items-center justify-center glow-ring transition-transform group-hover:scale-105">
              <Sparkles className="size-4.5" />
            </div>
            <div className="flex flex-col">
              <span className="font-display font-semibold text-lg sm:text-xl tracking-tight text-foreground leading-none">
                PDF AI RAG Studio
              </span>
              <span className="font-mono text-[10px] text-muted-foreground tracking-wider uppercase mt-0.5">
                Pinecone &amp; Gemini 2.5
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
            <a href="#pipeline" className="hover:text-foreground transition-colors">
              SOTA Pipeline
            </a>
            <a href="#features" className="hover:text-foreground transition-colors">
              Features
            </a>
            <a href="#how-it-works" className="hover:text-foreground transition-colors">
              How it works
            </a>
            <Link href="/dashboard" className="hover:text-foreground transition-colors">
              Dashboard
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <ModeToggle />

            <Link href="/dashboard" className="hidden sm:inline-flex">
              <button
                type="button"
                className="inline-flex items-center gap-2 h-9 px-4 rounded-xl bg-primary text-primary-foreground font-medium text-sm font-display hover:opacity-90 transition-all glow-ring cursor-pointer"
              >
                <span>Launch app</span>
                <ArrowRight className="size-4" />
              </button>
            </Link>
          </div>
        </div>
      </header>

      {/* ---------------- 3. HERO SECTION ---------------- */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 sm:pt-24 lg:pt-32 pb-16 text-center">
        <div className="max-w-3xl mx-auto flex flex-col items-center">
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full border border-border/80 bg-card/60 backdrop-blur text-xs font-medium text-muted-foreground mb-8 shadow-xs">
            <span className="relative flex size-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex rounded-full size-2 bg-primary" />
            </span>
            <span>SOTA 6-Stage RAG Architecture with Pinecone &amp; Google Gemini</span>
          </div>

          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.12] tracking-tight text-foreground mb-6">
            Chat with your <span className="text-gradient">PDFs &amp; web</span>{" "}
            <br className="hidden sm:block" /> like never before
          </h1>

          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl leading-relaxed mb-8">
            PDF AI RAG Studio turns dense documents and live web pages into high-precision 768-dim
            vector coordinates. Experience HyDE query expansion, RRF rank fusion, and L8
            context spotlighting with zero hallucination.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto mb-5">
            <Link href="/dashboard" className="w-full sm:w-auto">
              <button
                type="button"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 h-12 px-8 rounded-xl bg-primary text-primary-foreground font-display font-semibold text-base hover:opacity-90 transition-all glow-ring cursor-pointer"
              >
                <span>Open the workspace</span>
                <ArrowRight className="size-4.5" />
              </button>
            </Link>
            <a href="#pipeline" className="w-full sm:w-auto">
              <button
                type="button"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 h-12 px-7 rounded-xl border border-border bg-card/60 hover:bg-card text-foreground font-display font-medium text-base transition-colors cursor-pointer"
              >
                <span>Explore SOTA Pipeline</span>
              </button>
            </a>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs sm:text-sm text-muted-foreground/90 font-medium pt-1">
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2 className="size-3.5 text-primary" />
              <span>Google OAuth &amp; Email Sign-In</span>
            </span>
            <span className="text-border hidden sm:inline">•</span>
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck className="size-3.5 text-emerald-500" />
              <span>100% Private Client-Side Keys (BYOK)</span>
            </span>
            <span className="text-border hidden sm:inline">•</span>
            <span className="inline-flex items-center gap-1.5">
              <Zap className="size-3.5 text-amber-500" />
              <span>Zero Setup · Instant Research</span>
            </span>
          </div>
        </div>

        {/* Floating Mock Workspace Preview */}
        <div className="mt-12 sm:mt-16 max-w-4xl mx-auto">
          <div className="surface-panel rounded-2xl p-3 sm:p-5 text-left transition-all shadow-2xl">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-border/60">
              <div className="flex items-center gap-2">
                <span className="size-3 rounded-full bg-red-500" />
                <span className="size-3 rounded-full bg-amber-500" />
                <span className="size-3 rounded-full bg-emerald-500" />
              </div>
              <div className="flex items-center gap-2 font-mono text-xs text-muted-foreground select-none">
                <span className="hidden sm:inline">ns: col-contract-audit-2026</span>
                <span className="opacity-40">|</span>
                <span>pdf-ai-rag-studio / workspace</span>
              </div>
              <div className="size-3 opacity-0" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
              <div className="bg-card/70 border border-border/60 rounded-xl p-3.5 flex items-center gap-3">
                <div className="size-10 rounded-lg bg-primary/15 text-primary flex items-center justify-center shrink-0">
                  <Layers className="size-5" />
                </div>
                <div>
                  <div className="text-xs text-muted-foreground font-medium">Vector Dimension</div>
                  <div className="text-base font-bold font-mono text-foreground">768-dim Cosine</div>
                </div>
              </div>

              <div className="bg-card/70 border border-border/60 rounded-xl p-3.5 flex items-center gap-3">
                <div className="size-10 rounded-lg bg-primary/15 text-primary flex items-center justify-center shrink-0">
                  <Cpu className="size-5" />
                </div>
                <div>
                  <div className="text-xs text-muted-foreground font-medium">Pipeline Strategy</div>
                  <div className="text-base font-bold font-display text-foreground">
                    HyDE + RRF (k=60)
                  </div>
                </div>
              </div>

              <div className="bg-card/70 border border-border/60 rounded-xl p-3.5 flex items-center gap-3">
                <div className="size-10 rounded-lg bg-primary/15 text-primary flex items-center justify-center shrink-0">
                  <Globe className="size-5" />
                </div>
                <div>
                  <div className="text-xs text-muted-foreground font-medium">Active Vector Store</div>
                  <div className="text-base font-bold font-display text-foreground">
                    Pinecone Serverless
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-card/90 border border-border/60 rounded-xl p-4 sm:p-5 space-y-3.5">
              <div className="flex items-start gap-3">
                <div className="size-8 rounded-lg bg-primary/15 text-primary flex items-center justify-center shrink-0 mt-0.5">
                  <MessagesSquare className="size-4" />
                </div>
                <div>
                  <div className="text-xs text-muted-foreground font-medium mb-1">
                    Research Query
                  </div>
                  <p className="text-sm font-medium text-foreground">
                    What does §7.2 of the enterprise agreement specify regarding indemnity limits
                    and intellectual property claims?
                  </p>
                </div>
              </div>

              <div className="pl-11 border-l-2 border-primary/50 ml-4 py-1.5 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-primary font-semibold font-display">
                    Gemini 2.5 Flash Grounded Synthesis
                  </span>
                  <span className="font-mono text-[10px] px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-500 font-semibold">
                    CRAG: VERIFIED (98.4% match)
                  </span>
                </div>
                <p className="text-sm text-foreground/90 leading-relaxed">
                  According to §7.2 (Indemnification and Liabilities), third-party claims arising from
                  direct intellectual property infringement and gross negligence are exempted from
                  the standard liability cap. The indemnifying party is required to defend, hold
                  harmless, and settle all related claims within 30 business days…{" "}
                  <span className="text-primary font-mono text-xs font-semibold bg-primary/10 px-1.5 py-0.5 rounded">
                    [Master_Services_Agreement_Q3.pdf, Page 12, Chunk #4]
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- 4. PIPELINE SECTION ---------------- */}
      <section id="pipeline" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-foreground mb-4">
            State-of-the-Art 6-Stage RAG Pipeline
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
            Every query goes through a multi-pass retrieval, verification, and grading architecture
            engineered for absolute accuracy.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {pipelineStages.map((st, i) => {
            const Icon = st.icon;
            return (
              <div key={i} className="surface-panel rounded-2xl p-6 relative flex flex-col justify-between group hover:border-primary/50 transition-all shadow-sm">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-mono text-xs font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-md">
                      STAGE {st.num}
                    </span>
                    <span className="text-[11px] font-mono text-muted-foreground">{st.tag}</span>
                  </div>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="size-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                      <Icon className="size-4.5" />
                    </div>
                    <h3 className="font-display font-semibold text-base text-foreground">{st.name}</h3>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{st.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ---------------- 5. FEATURES SECTION ---------------- */}
      <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-border/60">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-foreground mb-4">
            Core Superpowers Built for Research
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
            Everything you need to process large document libraries and live web content effortlessly.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featureCards.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div key={idx} className="surface-panel rounded-2xl p-6 flex flex-col justify-between group hover:border-primary/40 transition-all shadow-sm">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="size-10 rounded-xl bg-primary/15 text-primary flex items-center justify-center">
                      <Icon className="size-5" />
                    </div>
                    <span className="text-[10px] font-mono uppercase tracking-wider bg-card px-2.5 py-1 rounded-full border border-border/70 text-muted-foreground">
                      {feat.badge}
                    </span>
                  </div>
                  <h3 className="font-display text-lg font-semibold text-foreground">{feat.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{feat.description}</p>
                </div>
                <div className="pt-5 mt-4 border-t border-border/50">
                  <Link href={feat.href} className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline">
                    <span>{feat.cta}</span>
                    <ArrowRight className="size-3" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ---------------- 6. HOW IT WORKS ---------------- */}
      <section id="how-it-works" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-border/60">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-foreground mb-4">
            How It Works in 3 Simple Steps
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="surface-panel rounded-2xl p-6 sm:p-7 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-5">
                <div className="size-11 rounded-xl bg-primary/15 text-primary flex items-center justify-center">
                  <FileText className="size-5.5" />
                </div>
                <span className="font-mono font-bold text-sm sm:text-base text-muted-foreground/80">01</span>
              </div>
              <h3 className="font-display text-lg sm:text-xl font-semibold text-foreground mb-2.5">
                1. Upload PDFs or Crawl Web
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Drop your PDF files or enter a website URL. Documents are chunked into semantic tokens with metadata.
              </p>
            </div>
          </div>

          <div className="surface-panel rounded-2xl p-6 sm:p-7 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-5">
                <div className="size-11 rounded-xl bg-primary/15 text-primary flex items-center justify-center">
                  <Layers className="size-5.5" />
                </div>
                <span className="font-mono font-bold text-sm sm:text-base text-muted-foreground/80">02</span>
              </div>
              <h3 className="font-display text-lg sm:text-xl font-semibold text-foreground mb-2.5">
                2. High-Speed Batch Indexing
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Parallel 768-dim embeddings land instantly in your Pinecone namespace collections for sub-35ms vector scans.
              </p>
            </div>
          </div>

          <div className="surface-panel rounded-2xl p-6 sm:p-7 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-5">
                <div className="size-11 rounded-xl bg-primary/15 text-primary flex items-center justify-center">
                  <MessagesSquare className="size-5.5" />
                </div>
                <span className="font-mono font-bold text-sm sm:text-base text-muted-foreground/80">03</span>
              </div>
              <h3 className="font-display text-lg sm:text-xl font-semibold text-foreground mb-2.5">
                3. Chat with Voice or Text
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Ask deep technical questions or dictate via voice. Receive verified, hallucination-free answers with exact source citations.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- 7. CTA SECTION ---------------- */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="rounded-3xl border border-border relative overflow-hidden bg-gradient-to-br from-primary/15 via-card to-accent/20 p-8 sm:p-14 text-center shadow-2xl">
          <div className="relative z-10 max-w-2xl mx-auto flex flex-col items-center">
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-foreground mb-5">
              Ready to turn your documents into answers?
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed mb-8">
              Jump straight in, connect your Pinecone and Gemini API keys, upload a PDF or crawl a URL,
              and start chatting in under two minutes.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
              <Link href="/dashboard" className="w-full sm:w-auto">
                <button
                  type="button"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 h-12 px-8 rounded-xl bg-primary text-primary-foreground font-display font-semibold text-base hover:opacity-90 transition-all glow-ring cursor-pointer"
                >
                  <span>Launch the studio</span>
                  <ArrowRight className="size-4.5" />
                </button>
              </Link>

              <Link href="/dashboard/account" className="w-full sm:w-auto">
                <button
                  type="button"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 h-12 px-7 rounded-xl border border-border bg-card/80 hover:bg-card text-foreground font-display font-medium text-base transition-colors cursor-pointer"
                >
                  <span>Configure API keys (BYOK)</span>
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- 8. FOOTER ---------------- */}
      <footer className="border-t border-border/60 bg-background/60 py-10 mt-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="size-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center glow-ring">
              <Sparkles className="size-4" />
            </div>
            <span className="font-display font-semibold text-base tracking-tight text-foreground">
              PDF AI RAG Studio
            </span>
          </Link>

          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} PDF AI RAG Studio. Built with Next.js 15, FastAPI,
            Pinecone &amp; Google Gemini.
          </p>
        </div>
      </footer>
    </div>
  );
}
