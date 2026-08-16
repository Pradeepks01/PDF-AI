"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { motion } from "framer-motion";
import {
  Sparkles,
  ArrowRight,
  Sun,
  Moon,
  Zap,
  ShieldCheck,
  Layers,
  ScanSearch,
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

export default function HomePage() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted ? resolvedTheme === "dark" || theme === "dark" : true;

  const toggleTheme = () => {
    setTheme(isDark ? "light" : "dark");
  };

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
    <div className="min-h-screen bg-background text-foreground relative overflow-x-hidden selection:bg-primary/25 selection:text-foreground">
      {/* ---------------- 1. AMBIENT BACKGROUND GLOWS ---------------- */}
      <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden" aria-hidden="true">
        {/* Subtle 44px grid backdrop */}
        <div className="absolute inset-0 grid-backdrop opacity-40" />

        {/* Top-center primary glow */}
        <div
          className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[42rem] h-[42rem] rounded-full blur-[130px] opacity-20 pointer-events-none"
          style={{ background: "var(--primary)" }}
        />

        {/* Right accent glow */}
        <div
          className="absolute top-[35%] right-[-10%] w-[30rem] h-[30rem] rounded-full blur-[100px] opacity-30 pointer-events-none"
          style={{ background: "var(--accent)" }}
        />

        {/* Bottom-left primary glow */}
        <div
          className="absolute bottom-[10%] left-[-8%] w-[30rem] h-[30rem] rounded-full blur-[100px] opacity-10 pointer-events-none"
          style={{ background: "var(--primary)" }}
        />
      </div>

      {/* ---------------- 2. STICKY NAV HEADER ---------------- */}
      <header className="sticky top-0 z-50 h-16 backdrop-blur-xl bg-background/70 border-b border-border/60 transition-colors">
        <div className="max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Logo */}
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

          {/* Nav links (md+) */}
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
            <a href="#comparison" className="hover:text-foreground transition-colors">
              Comparison
            </a>
            <Link href="/dashboard" className="hover:text-foreground transition-colors">
              Dashboard
            </Link>
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-3">
            {/* Theme toggle button */}
            <button
              onClick={toggleTheme}
              className="size-9 rounded-xl border border-border/70 bg-card/60 hover:bg-card text-foreground flex items-center justify-center transition-colors cursor-pointer"
              aria-label="Toggle theme"
              type="button"
            >
              {mounted ? (
                isDark ? (
                  <Sun className="size-4.5 text-primary" />
                ) : (
                  <Moon className="size-4.5 text-foreground" />
                )
              ) : (
                <Sun className="size-4.5 text-primary" />
              )}
            </button>

            {/* Launch App Button */}
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
        {/* Entrance motion container */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="max-w-3xl mx-auto flex flex-col items-center"
        >
          {/* Pill badge */}
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full border border-border/80 bg-card/60 backdrop-blur text-xs font-medium text-muted-foreground mb-8 shadow-xs">
            <span className="relative flex size-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex rounded-full size-2 bg-primary" />
            </span>
            <span>SOTA 6-Stage RAG Architecture with Pinecone &amp; Google Gemini</span>
          </div>

          {/* H1 Heading */}
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.12] tracking-tight text-foreground mb-6">
            Chat with your <span className="text-gradient">PDFs &amp; web</span>{" "}
            <br className="hidden sm:block" /> like never before
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl leading-relaxed mb-8">
            PDF AI RAG Studio turns dense documents and live web pages into high-precision 768-dim
            vector coordinates. Experience HyDE query expansion, RRF rank fusion, and L8
            context spotlighting with zero hallucination.
          </p>

          {/* Action Buttons */}
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

          {/* Hero Trust Badges */}
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs sm:text-sm text-muted-foreground/90 font-medium pt-1">
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2 className="size-3.5 text-primary" />
              <span>Google OAuth &amp; Email Sign-In</span>
            </span>
            <span className="text-border hidden sm:inline">•</span>
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck className="size-3.5 text-success" />
              <span>100% Private Client-Side Keys (BYOK)</span>
            </span>
            <span className="text-border hidden sm:inline">•</span>
            <span className="inline-flex items-center gap-1.5">
              <Zap className="size-3.5 text-warning" />
              <span>Zero Setup · Instant Research</span>
            </span>
          </div>
        </motion.div>

        {/* Floating Mock Workspace Preview */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15, ease: "easeOut" }}
          className="mt-12 sm:mt-16 max-w-4xl mx-auto"
        >
          <div className="surface-panel rounded-2xl p-3 sm:p-5 text-left transition-all">
            {/* Browser chrome top bar */}
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-border/60">
              <div className="flex items-center gap-2">
                <span className="size-3 rounded-full bg-destructive" />
                <span className="size-3 rounded-full bg-warning" />
                <span className="size-3 rounded-full bg-success" />
              </div>
              <div className="flex items-center gap-2 font-mono text-xs text-muted-foreground select-none">
                <span className="hidden sm:inline">ns: col-contract-audit-2026</span>
                <span className="opacity-40">|</span>
                <span>pdf-ai-rag-studio / workspace</span>
              </div>
              <div className="size-3 opacity-0" />
            </div>

            {/* 3-col mini stats */}
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

            {/* Mock chat row */}
            <div className="bg-card/90 border border-border/60 rounded-xl p-4 sm:p-5 space-y-3.5">
              {/* Question */}
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

              {/* Answer */}
              <div className="pl-11 border-l-2 border-primary/50 ml-4 py-1.5 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-primary font-semibold font-display">
                    Gemini 2.5 Flash Grounded Synthesis
                  </span>
                  <span className="font-mono text-[10px] px-2 py-0.5 rounded-md bg-success/15 text-success font-semibold">
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
        </motion.div>
      </section>

      {/* ---------------- 4. TRUST BAR ---------------- */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="rounded-2xl border border-border/60 bg-card/40 backdrop-blur p-4 sm:p-6 grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-xl bg-primary/15 text-primary flex items-center justify-center shrink-0">
              <Zap className="size-4.5" />
            </div>
            <span className="text-xs sm:text-sm font-medium text-foreground">
              Gemini 2.5 Flash rotation
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="size-9 rounded-xl bg-primary/15 text-primary flex items-center justify-center shrink-0">
              <ShieldCheck className="size-4.5" />
            </div>
            <span className="text-xs sm:text-sm font-medium text-foreground">
              BYOK keys local to browser
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="size-9 rounded-xl bg-primary/15 text-primary flex items-center justify-center shrink-0">
              <Layers className="size-4.5" />
            </div>
            <span className="text-xs sm:text-sm font-medium text-foreground">
              Pinecone serverless vectors
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="size-9 rounded-xl bg-primary/15 text-primary flex items-center justify-center shrink-0">
              <ScanSearch className="size-4.5" />
            </div>
            <span className="text-xs sm:text-sm font-medium text-foreground">
              Fast batch PDF &amp; Web ingest
            </span>
          </div>
        </div>
      </section>

      {/* ---------------- 5. SOTA 6-STAGE PIPELINE SECTION ---------------- */}
      <section id="pipeline" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="uppercase text-primary font-mono text-xs font-semibold tracking-wider mb-3">
            Architecture
          </div>
          <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-foreground mb-4">
            The SOTA 6-Stage Retrieval Pipeline
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground">
            How our Python FastAPI retrieval engine processes queries with mathematical precision
            to eliminate hallucinations and semantic drop-off.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pipelineStages.map((stage, idx) => {
            const Icon = stage.icon;
            return (
              <motion.div
                key={stage.num}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.5, delay: idx * 0.08 }}
                className="h-full"
              >
                <div className="surface-panel rounded-2xl p-6 sm:p-7 h-full flex flex-col justify-between hover:-translate-y-1 transition-all duration-300 group">
                  <div>
                    <div className="flex items-center justify-between mb-5">
                      <div className="size-11 rounded-xl bg-primary/15 text-primary flex items-center justify-center group-hover:scale-105 transition-transform">
                        <Icon className="size-5.5" />
                      </div>
                      <span className="font-mono font-bold text-sm text-primary bg-primary/10 px-2.5 py-1 rounded-lg">
                        {stage.num}
                      </span>
                    </div>

                    <div className="font-mono text-[11px] text-muted-foreground uppercase tracking-wider mb-1">
                      {stage.tag}
                    </div>
                    <h3 className="font-display text-lg sm:text-xl font-semibold text-foreground mb-2.5">
                      {stage.name}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {stage.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* ---------------- 6. CORE PLATFORM FEATURES ---------------- */}
      <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-border/40">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="uppercase text-primary font-mono text-xs font-semibold tracking-wider mb-3">
            Features
          </div>
          <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-foreground mb-4">
            Built for Modern Document Research
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground">
            From multi-page PDF documents to live web articles, analyze everything effortlessly
            with high performance and enterprise privacy.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {featureCards.map((card, idx) => {
            const Icon = card.icon;
            return (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.5, delay: idx * 0.06 }}
                className="h-full"
              >
                <div className="surface-panel rounded-2xl p-6 sm:p-7 h-full flex flex-col justify-between hover:-translate-y-1 transition-all duration-300 group">
                  <div>
                    <div className="flex items-center justify-between mb-5">
                      <div className="size-11 rounded-xl bg-card/60 border border-border/80 flex items-center justify-center text-primary group-hover:scale-105 transition-transform">
                        <Icon className="size-5.5" />
                      </div>
                      <span className="font-mono text-[10px] text-muted-foreground bg-muted/60 px-2 py-0.5 rounded">
                        {card.badge}
                      </span>
                    </div>

                    <h3 className="font-display text-lg sm:text-xl font-semibold text-foreground mb-2.5">
                      {card.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {card.description}
                    </p>
                  </div>

                  <div className="pt-6 mt-6 border-t border-border/40">
                    <Link
                      href={card.href}
                      className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-primary group-hover:text-primary-glow transition-colors"
                    >
                      <span>{card.cta}</span>
                      <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* ---------------- 7. COMPARISON MATRIX ---------------- */}
      <section id="comparison" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-border/40">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="uppercase text-primary font-mono text-xs font-semibold tracking-wider mb-3">
            Benchmarking
          </div>
          <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-foreground mb-4">
            Traditional Search vs. Standard RAG vs. PDF AI Studio
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground">
            Why multi-stage retrieval with Reciprocal Rank Fusion outperforms standard vector query models.
          </p>
        </div>

        <div className="max-w-4xl mx-auto overflow-x-auto border border-border/70 rounded-2xl bg-card shadow-2xl">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/60 border-b border-border/60 text-xs uppercase font-mono text-muted-foreground">
              <tr>
                <th className="p-4 sm:p-5">Capability</th>
                <th className="p-4 sm:p-5">Keyword / SQL Search</th>
                <th className="p-4 sm:p-5">Basic Vector Search</th>
                <th className="p-4 sm:p-5 text-primary font-bold">PDF AI RAG Studio</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40 font-sans text-xs sm:text-sm">
              <tr>
                <td className="p-4 sm:p-5 font-semibold text-foreground">Query Understanding</td>
                <td className="p-4 sm:p-5 text-muted-foreground">Verbatim matches only</td>
                <td className="p-4 sm:p-5 text-muted-foreground">Naive embedding similarity</td>
                <td className="p-4 sm:p-5 text-primary font-semibold">HyDE Expert Query Expansion</td>
              </tr>
              <tr>
                <td className="p-4 sm:p-5 font-semibold text-foreground">Retrieval Hybridization</td>
                <td className="p-4 sm:p-5 text-muted-foreground">None</td>
                <td className="p-4 sm:p-5 text-muted-foreground">Dense vectors only</td>
                <td className="p-4 sm:p-5 text-primary font-semibold">Dense + BM25 + RRF (k=60)</td>
              </tr>
              <tr>
                <td className="p-4 sm:p-5 font-semibold text-foreground">Noise Elimination</td>
                <td className="p-4 sm:p-5 text-muted-foreground">None</td>
                <td className="p-4 sm:p-5 text-muted-foreground">Top-K cutoff only</td>
                <td className="p-4 sm:p-5 text-primary font-semibold">Cross-Encoder + CRAG Grader</td>
              </tr>
              <tr>
                <td className="p-4 sm:p-5 font-semibold text-foreground">Grounded Citations</td>
                <td className="p-4 sm:p-5 text-muted-foreground">None</td>
                <td className="p-4 sm:p-5 text-muted-foreground">Vague chunk references</td>
                <td className="p-4 sm:p-5 text-primary font-semibold">L8 Spotlight [Doc, Page X]</td>
              </tr>
              <tr>
                <td className="p-4 sm:p-5 font-semibold text-foreground">API Key Privacy</td>
                <td className="p-4 sm:p-5 text-muted-foreground">Server hardcoded</td>
                <td className="p-4 sm:p-5 text-muted-foreground">Shared API quota</td>
                <td className="p-4 sm:p-5 text-primary font-semibold">100% BYOK Browser Vault</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* ---------------- 8. HOW IT WORKS ---------------- */}
      <section id="how-it-works" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-border/40">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="uppercase text-primary font-mono text-xs font-semibold tracking-wider mb-3">
            Workflow
          </div>
          <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-foreground mb-4">
            From Raw Document to Cited Answer in 3 Steps
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground">
            A frictionless vector ingestion pipeline optimized for high speed, semantic depth, and
            factual accuracy.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0 }}
            className="relative"
          >
            <div className="surface-panel rounded-2xl p-6 sm:p-7 h-full flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="size-11 rounded-xl bg-primary/15 text-primary flex items-center justify-center">
                    <FileText className="size-5.5" />
                  </div>
                  <span className="font-mono font-bold text-sm sm:text-base text-muted-foreground/80">
                    01
                  </span>
                </div>
                <h3 className="font-display text-lg sm:text-xl font-semibold text-foreground mb-2.5">
                  1. Ingest PDF or Web Page
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Drop any multi-page PDF or enter a live web URL. Text is extracted, cleaned, and
                  tokenized into optimal semantic passages.
                </p>
              </div>
            </div>

            <div
              className="hidden md:flex absolute -right-3.5 top-1/2 -translate-y-1/2 z-10 size-7 rounded-full bg-card border border-border/80 items-center justify-center text-muted-foreground"
              aria-hidden="true"
            >
              <ArrowRight className="size-3.5" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="relative"
          >
            <div className="surface-panel rounded-2xl p-6 sm:p-7 h-full flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="size-11 rounded-xl bg-primary/15 text-primary flex items-center justify-center">
                    <Layers className="size-5.5" />
                  </div>
                  <span className="font-mono font-bold text-sm sm:text-base text-muted-foreground/80">
                    02
                  </span>
                </div>
                <h3 className="font-display text-lg sm:text-xl font-semibold text-foreground mb-2.5">
                  2. High-Speed Batch Indexing
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Parallel 768-dim embeddings land instantly in your Pinecone namespace collections,
                  ready for sub-35ms cosine similarity scans.
                </p>
              </div>
            </div>

            <div
              className="hidden md:flex absolute -right-3.5 top-1/2 -translate-y-1/2 z-10 size-7 rounded-full bg-card border border-border/80 items-center justify-center text-muted-foreground"
              aria-hidden="true"
            >
              <ArrowRight className="size-3.5" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="relative"
          >
            <div className="surface-panel rounded-2xl p-6 sm:p-7 h-full flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="size-11 rounded-xl bg-primary/15 text-primary flex items-center justify-center">
                    <MessagesSquare className="size-5.5" />
                  </div>
                  <span className="font-mono font-bold text-sm sm:text-base text-muted-foreground/80">
                    03
                  </span>
                </div>
                <h3 className="font-display text-lg sm:text-xl font-semibold text-foreground mb-2.5">
                  3. Chat with Voice or Text
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Ask deep technical questions or dictate via voice. Receive verified, hallucination-free
                  answers with exact source citations.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ---------------- 9. CTA SECTION ---------------- */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="rounded-3xl border border-border relative overflow-hidden bg-gradient-to-br from-primary/15 via-card to-accent/20 p-8 sm:p-14 text-center shadow-2xl"
        >
          {/* Grid backdrop overlay at 30% */}
          <div className="absolute inset-0 grid-backdrop opacity-30 pointer-events-none" />

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
        </motion.div>
      </section>

      {/* ---------------- 10. FOOTER ---------------- */}
      <footer className="border-t border-border/60 bg-background/60 py-10 mt-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="size-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center glow-ring">
              <Sparkles className="size-4" />
            </div>
            <span className="font-display font-semibold text-base tracking-tight text-foreground">
              PDF AI RAG Studio
            </span>
          </Link>

          {/* Nav links */}
          <div className="flex items-center gap-6 text-xs sm:text-sm text-muted-foreground">
            <a href="#pipeline" className="hover:text-foreground transition-colors">
              SOTA Pipeline
            </a>
            <a href="#features" className="hover:text-foreground transition-colors">
              Features
            </a>
            <a href="#how-it-works" className="hover:text-foreground transition-colors">
              How it works
            </a>
            <a href="#comparison" className="hover:text-foreground transition-colors">
              Comparison
            </a>
            <Link href="/dashboard" className="hover:text-foreground transition-colors">
              Dashboard
            </Link>
          </div>

          {/* Copyright */}
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} PDF AI RAG Studio. Built with Next.js 15, FastAPI,
            Pinecone &amp; Google Gemini.
          </p>
        </div>
      </footer>
    </div>
  );
}
