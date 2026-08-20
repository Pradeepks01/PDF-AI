'use client'

import React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Layers,
  FileText,
  Globe,
  MessagesSquare,
  KeyRound,
  Mic,
  Download,
  Database,
  CheckCircle2,
  FileStack,
  Scissors,
  Boxes,
  Search,
  ListFilter,
  Shuffle,
  Gauge,
  BadgeCheck,
  Highlighter,
  PanelsTopLeft,
  Sun,
  Moon,
  ExternalLink,
  ChevronRight
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ModeToggle } from '@/components/ModeToggle'
import { LogoIcon } from '@/components/LogoIcon'

export default function LandingPage() {
  // ---------------- 1. Features Data ----------------
  const features = [
    {
      icon: FileText,
      badge: 'High-Throughput',
      title: 'Multi-PDF Vector Collections',
      description:
        'Upload research papers, financial audits, or contracts. Documents are parsed, split into optimal semantic chunks, and embedded in parallel batches into isolated Pinecone namespaces.',
      cta: 'Open workspace',
      href: '/dashboard',
    },
    {
      icon: Globe,
      badge: 'Live Ingestion',
      title: 'Real-Time Web Crawler',
      description:
        'Point the crawler at any documentation URL or website. Content is scraped with BeautifulSoup & Trafilatura, converted to clean markdown, and vector indexed alongside your PDFs.',
      cta: 'Open web crawler',
      href: '/dashboard/web-loader',
    },
    {
      icon: MessagesSquare,
      badge: 'Zero Hallucination',
      title: 'SOTA 6-Stage RAG Chat',
      description:
        'Queries trigger HyDE expansion, Hybrid Dense (768-dim) + Sparse BM25 scoring, Reciprocal Rank Fusion (k=60), Cross-Encoder re-ranking, and CRAG grading before Google Gemini answers.',
      cta: 'Start research session',
      href: '/dashboard',
    },
    {
      icon: KeyRound,
      badge: '100% Private',
      title: 'Bring Your Own Keys (BYOK)',
      description:
        'Connect your personal Pinecone (pcsk_...) and Google Gemini API keys. Keys reside strictly in your browser localStorage and are sent via request headers — never stored on external servers.',
      cta: 'Manage API vault',
      href: '/dashboard/account',
    },
  ]

  // ---------------- 2. 16 Capability Grid Cards ----------------
  const capabilities = [
    { icon: FileStack, label: 'Multi-PDF Collections' },
    { icon: Globe, label: 'Web Page Crawler' },
    { icon: Scissors, label: 'Smart Semantic Chunking' },
    { icon: Boxes, label: 'Pinecone Namespaces' },
    { icon: Search, label: 'HyDE Query Expansion' },
    { icon: Sparkles, label: 'Gemini 2.5 Flash Synthesis' },
    { icon: ListFilter, label: 'BM25 Lexical Scoring' },
    { icon: Shuffle, label: 'Reciprocal Rank Fusion (k=60)' },
    { icon: Gauge, label: 'Sub-Second Retrieval' },
    { icon: BadgeCheck, label: 'CRAG Document Grader' },
    { icon: Highlighter, label: 'Verbatim In-Line Citations' },
    { icon: Database, label: '768-Dim Vector Embeddings' },
    { icon: Mic, label: 'Voice-to-Text Dictation' },
    { icon: PanelsTopLeft, label: 'Split-Screen Workspace' },
    { icon: Download, label: '1-Click Markdown Export (.md)' },
    { icon: ShieldCheck, label: '100% Client-Side BYOK' },
  ]

  // ---------------- 3. 3-Step How It Works ----------------
  const steps = [
    {
      step: '01',
      title: 'Ingest',
      icon: FileText,
      description:
        'Upload multiple PDF documents or crawl any live documentation URL to extract clean, formatted markdown content.',
    },
    {
      step: '02',
      title: 'Index',
      icon: Layers,
      description:
        'Generate 768-dimensional Google embeddings and index semantic vectors in parallel into isolated serverless Pinecone namespaces.',
    },
    {
      step: '03',
      title: 'Retrieve & Answer',
      icon: MessagesSquare,
      description:
        'Execute hybrid dense + sparse BM25 search, re-rank with reciprocal rank fusion, and generate cited answers with Google Gemini.',
    },
  ]

  // ---------------- 4. TrustBar Items ----------------
  const trustItems = [
    { icon: Sparkles, label: 'Gemini-Powered' },
    { icon: KeyRound, label: 'Your Keys Local Only' },
    { icon: Database, label: 'Pinecone Vector Search' },
    { icon: FileText, label: 'PDF + Web Ingestion' },
  ]

  return (
    <div className="min-h-screen text-foreground relative selection:bg-primary/25 selection:text-foreground overflow-x-hidden">
      
      {/* ---------------- 1. AMBIENT BACKGROUND & FULL PAGE BOX-GRID ---------------- */}
      <div className="landing-bg" aria-hidden="true" />
      <div className="landing-grid-full" aria-hidden="true" />

      <div
        className="fixed top-[-8%] left-1/2 -translate-x-1/2 w-[44rem] h-[44rem] rounded-full blur-[120px] bg-primary/20 pointer-events-none z-0"
        aria-hidden="true"
      />
      <div
        className="fixed top-[36%] right-[-12%] w-[32rem] h-[32rem] rounded-full blur-[120px] bg-accent/30 pointer-events-none z-0"
        aria-hidden="true"
      />
      <div
        className="fixed bottom-[8%] left-[-10%] w-[32rem] h-[32rem] rounded-full blur-[120px] bg-primary/10 pointer-events-none z-0"
        aria-hidden="true"
      />

      <div className="relative z-10">
        {/* ---------------- 2. NAV HEADER ---------------- */}
        <header className="sticky top-0 z-50 border-b border-white/10 bg-white/5 backdrop-blur-md transition-all">
          <div className="max-w-7xl mx-auto h-16 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
            
            {/* Logo + Wordmark */}
            <Link href="/" className="flex items-center gap-2 group">
              <LogoIcon className="size-6 text-white group-hover:scale-105 transition-transform" />
              <span className="font-display font-bold text-lg sm:text-xl tracking-tight text-white">
                PDF AI
              </span>
            </Link>

            {/* Center Links */}
            <nav className="hidden md:flex items-center gap-8 text-xs font-semibold text-blue-100/90">
              <a href="#features" className="hover:text-white transition-colors">
                Features
              </a>
              <a href="#how-it-works" className="hover:text-white transition-colors">
                How it works
              </a>
              <Link href="/dashboard" className="hover:text-white transition-colors">
                Dashboard
              </Link>
            </nav>

            {/* Right Controls */}
            <div className="flex items-center gap-3">
              <ModeToggle />
              <Link href="/sign-in" className="hidden sm:inline-flex">
                <Button
                  size="sm"
                  className="h-9 px-4 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-display font-semibold text-xs transition-all shadow-md cursor-pointer"
                >
                  <span>Sign In</span>
                  <ArrowRight className="size-3.5 ml-1" />
                </Button>
              </Link>
            </div>
          </div>
        </header>

      {/* ---------------- 3. HERO SECTION ---------------- */}
      <section className="relative pt-20 sm:pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="max-w-3xl mx-auto space-y-6"
        >
          {/* Pill Badge with Pinging Dot */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/20 bg-white/10 text-white text-xs font-mono font-medium shadow-md backdrop-blur-md">
            <span className="size-2 rounded-full bg-cyan-300 animate-pulse" />
            <span>Retrieval-augmented generation, now in your browser</span>
          </div>

          {/* H1 Heading */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-display font-extrabold tracking-tight text-white leading-[1.1] drop-shadow-sm">
            Chat with your PDFs &amp; web <span className="text-gradient">like never before</span>
          </h1>

          {/* Subcopy */}
          <p className="text-sm sm:text-base md:text-lg text-blue-100/90 leading-relaxed max-w-2xl mx-auto font-normal">
            Powered by Pinecone 768-dim vector search and Google Gemini 2.5 Flash for sub-second retrieval,
            hybrid sparse-dense rank fusion, and zero-hallucination document synthesis.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2">
            <Link href="/dashboard" className="w-full sm:w-auto">
              <Button
                size="lg"
                className="w-full sm:w-auto h-12 px-7 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-display font-semibold text-sm transition-all glow-ring cursor-pointer shadow-lg"
              >
                <span>Open the workspace</span>
                <ArrowRight className="size-4 ml-2" />
              </Button>
            </Link>

            <a href="#how-it-works" className="w-full sm:w-auto">
              <Button
                variant="outline"
                size="lg"
                className="w-full sm:w-auto h-12 px-6 rounded-xl border-white/25 bg-white/10 hover:bg-white/20 text-white font-display font-medium text-sm transition-all cursor-pointer backdrop-blur-md"
              >
                See how it works
              </Button>
            </a>
          </div>
        </motion.div>

        {/* Floating Mock Workspace */}
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15, ease: 'easeOut' }}
          className="mt-14 max-w-4xl mx-auto text-left"
        >
          <div className="surface-panel rounded-2xl overflow-hidden shadow-2xl border border-border/80">
            {/* Window Chrome Header */}
            <div className="h-10 border-b border-border/60 bg-card/80 px-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="size-3 rounded-full bg-red-500/80" />
                <span className="size-3 rounded-full bg-yellow-500/80" />
                <span className="size-3 rounded-full bg-emerald-500/80" />
              </div>
              <span className="font-mono text-xs text-muted-foreground truncate">
                pdf-ai / workspace
              </span>
              <div className="w-12" />
            </div>

            {/* 3-Column MiniStat Row */}
            <div className="grid grid-cols-3 border-b border-border/60 bg-background/50 text-center py-3 px-4 text-xs font-mono">
              <div className="border-r border-border/60">
                <span className="text-muted-foreground block text-[10px]">COLLECTIONS</span>
                <span className="font-bold text-foreground text-sm">6</span>
              </div>
              <div className="border-r border-border/60">
                <span className="text-muted-foreground block text-[10px]">DOCUMENTS</span>
                <span className="font-bold text-foreground text-sm">142</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[10px]">PAGES CRAWLED</span>
                <span className="font-bold text-foreground text-sm">318</span>
              </div>
            </div>

            {/* Mock Q&A Conversation Feed */}
            <div className="p-5 sm:p-6 space-y-4 text-xs sm:text-sm bg-card/40">
              {/* User Bubble */}
              <div className="flex justify-end">
                <div className="max-w-[85%] sm:max-w-[75%] rounded-2xl rounded-tr-none bg-primary text-primary-foreground p-3.5 shadow-xs font-medium">
                  What is the aggregate liability cap under Section 9.2 of the Master Services Agreement?
                </div>
              </div>

              {/* Bot Bubble */}
              <div className="flex gap-3 items-start justify-start">
                <div className="size-8 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shrink-0 glow-ring mt-0.5">
                  <Sparkles className="size-4" />
                </div>
                <div className="max-w-[85%] sm:max-w-[80%] rounded-2xl rounded-tl-none bg-card border border-border/80 text-foreground p-4 space-y-2.5 shadow-xs">
                  <p className="leading-relaxed">
                    Under <strong>Section 9.2 (Limitation of Liability)</strong>, the total aggregate liability of either party for all claims arising out of this Agreement is strictly capped at <strong>2.0× the total fees paid</strong> in the preceding 12-month period, excluding instances of gross negligence or willful misconduct.
                  </p>
                  
                  {/* Grounded Citation Badge */}
                  <div className="pt-2 border-t border-border/50 flex flex-wrap items-center gap-2 text-[11px] font-mono">
                    <span className="inline-flex items-center gap-1.5 bg-primary/10 text-primary border border-primary/25 px-2.5 py-1 rounded-lg">
                      <FileText className="size-3" />
                      <span>[Contract-Q3.pdf, p.12]</span>
                    </span>
                    <span className="text-emerald-500 font-semibold">✓ 98.4% Grounded Match</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ---------------- 4. TRUST BAR ---------------- */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto my-6" aria-label="Key highlights">
        <div className="rounded-2xl border border-border/50 bg-card/40 backdrop-blur-md p-4 sm:p-5 shadow-lg">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            {trustItems.map((item, idx) => {
              const Icon = item.icon
              return (
                <div key={idx} className="flex items-center justify-center gap-2 text-xs font-mono font-medium text-foreground">
                  <Icon className="size-4 text-primary shrink-0" />
                  <span>{item.label}</span>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ---------------- 5. FEATURES SECTION ---------------- */}
      <section id="features" className="scroll-mt-20 py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
          <span className="text-primary font-mono text-xs tracking-wider uppercase font-semibold">
            Features
          </span>
          <h2 className="text-3xl sm:text-4xl font-display font-bold text-foreground">
            Everything you need to ground AI in your data
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Built from scratch for deep document extraction, parallel vector indexing, and zero-hallucination verification.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((feat, idx) => {
            const Icon = feat.icon
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.5, delay: idx * 0.06 }}
                className="surface-panel rounded-2xl p-6 sm:p-8 space-y-4 hover:-translate-y-1 transition-all duration-300 group border border-border/80 hover:border-primary/40 shadow-xl"
              >
                <div className="flex items-center justify-between">
                  <div className="size-11 rounded-xl bg-primary/15 text-primary flex items-center justify-center glow-ring group-hover:scale-105 transition-transform">
                    <Icon className="size-5" />
                  </div>
                  <span className="text-[10px] font-mono font-semibold uppercase px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
                    {feat.badge}
                  </span>
                </div>

                <h3 className="text-lg sm:text-xl font-display font-bold text-foreground">
                  {feat.title}
                </h3>

                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  {feat.description}
                </p>

                <Link
                  href={feat.href}
                  className="inline-flex items-center gap-1.5 text-xs font-display font-semibold text-primary group-hover:translate-x-1 transition-transform pt-1"
                >
                  <span>{feat.cta}</span>
                  <ChevronRight className="size-3.5" />
                </Link>
              </motion.div>
            )
          })}
        </div>
      </section>

      {/* ---------------- 6. CAPABILITY GRID (16 CARDS) ---------------- */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto" aria-label="Full system capabilities">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
          <span className="text-primary font-mono text-xs tracking-wider uppercase font-semibold">
            Capabilities
          </span>
          <h2 className="text-2xl sm:text-3xl font-display font-bold text-foreground">
            Complete Toolkit for Production RAG
          </h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5 sm:gap-4">
          {capabilities.map((cap, idx) => {
            const Icon = cap.icon
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ type: 'spring', stiffness: 260, damping: 20, delay: idx * 0.03 }}
                className="surface-panel rounded-xl p-4 flex flex-col items-center justify-center text-center space-y-3 group hover:-translate-y-1.5 transition-all duration-200 border border-border/80 hover:border-primary/40 shadow-md focus-visible:ring-2 focus-visible:ring-primary cursor-default relative overflow-hidden"
              >
                <div className="size-10 rounded-xl bg-card border border-border/80 text-primary flex items-center justify-center group-hover:scale-110 group-hover:bg-primary/15 transition-all">
                  <Icon className="size-5" />
                </div>
                <span className="font-display font-medium text-xs sm:text-sm text-foreground">
                  {cap.label}
                </span>

                {/* Expanding accent underline on hover */}
                <div className="absolute bottom-0 left-0 h-0.5 w-0 bg-primary group-hover:w-full transition-all duration-300" />
              </motion.div>
            )
          })}
        </div>
      </section>

      {/* ---------------- 7. HOW IT WORKS ---------------- */}
      <section id="how-it-works" className="scroll-mt-20 py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
          <span className="text-primary font-mono text-xs tracking-wider uppercase font-semibold">
            Workflow
          </span>
          <h2 className="text-3xl sm:text-4xl font-display font-bold text-foreground">
            From document to answer in three steps
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground">
            No complex infrastructure setup. Connect your keys and analyze documents instantly.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
          {steps.map((step, idx) => {
            const Icon = step.icon
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="surface-panel rounded-2xl p-6 sm:p-7 space-y-4 border border-border/80 shadow-xl relative"
              >
                <div className="flex items-center justify-between">
                  <div className="size-11 rounded-xl bg-primary/15 text-primary flex items-center justify-center glow-ring">
                    <Icon className="size-5" />
                  </div>
                  <span className="text-2xl font-mono font-extrabold text-primary/40">
                    {step.step}
                  </span>
                </div>

                <h3 className="text-lg font-display font-bold text-foreground">
                  {step.title}
                </h3>

                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  {step.description}
                </p>

                {/* Arrow Connector on desktop between cards */}
                {idx < steps.length - 1 && (
                  <div className="hidden md:block absolute -right-4 top-1/2 -translate-y-1/2 text-primary/40 z-10">
                    <ArrowRight className="size-5" />
                  </div>
                )}
              </motion.div>
            )
          })}
        </div>
      </section>

      {/* ---------------- 8. CTA SECTION ---------------- */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5 }}
          className="rounded-3xl bg-gradient-to-br from-primary/15 via-card to-accent/20 border border-primary/25 relative overflow-hidden p-8 sm:p-14 text-center shadow-2xl space-y-6"
        >
          {/* Subtle Grid Backdrop Overlay */}
          <div className="absolute inset-0 grid-backdrop opacity-30 pointer-events-none" aria-hidden="true" />

          <div className="relative z-10 max-w-2xl mx-auto space-y-4">
            <h2 className="text-2xl sm:text-4xl font-display font-bold text-foreground leading-tight">
              Ready to turn your documents into answers?
            </h2>
            <p className="text-xs sm:text-sm md:text-base text-muted-foreground leading-relaxed">
              Jump straight in, connect your Pinecone and Gemini API keys, upload a PDF or crawl a URL,
              and start chatting in under two minutes.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-4">
              <Link href="/dashboard" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  className="w-full sm:w-auto h-12 px-8 rounded-xl bg-primary text-primary-foreground font-display font-semibold text-sm hover:opacity-90 transition-all glow-ring cursor-pointer"
                >
                  <span>Launch the studio</span>
                  <ArrowRight className="size-4 ml-2" />
                </Button>
              </Link>

              <Link href="/dashboard/account" className="w-full sm:w-auto">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto h-12 px-6 rounded-xl border-border bg-card/80 hover:bg-card text-foreground font-display font-medium text-sm transition-colors cursor-pointer"
                >
                  Configure API keys (BYOK)
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ---------------- 9. SITE FOOTER ---------------- */}
      <footer className="border-t border-border/60 bg-background/80 py-12 px-4 sm:px-6 lg:px-8 mt-12">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-border/60 text-xs">
          
          {/* Logo & Tagline */}
          <div className="space-y-3 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 group">
              <LogoIcon className="size-5 text-white" />
              <span className="font-display font-bold text-sm tracking-tight text-foreground">
                PDF AI
              </span>
            </Link>
            <p className="text-muted-foreground leading-relaxed">
              SOTA 6-stage Retrieval-Augmented Generation platform powered by Pinecone &amp; Google Gemini 2.5 Flash.
            </p>
          </div>

          {/* Product Links */}
          <div className="space-y-2.5">
            <span className="font-display font-semibold text-foreground tracking-wide block uppercase text-[11px]">
              Product
            </span>
            <ul className="space-y-2 text-muted-foreground">
              <li>
                <Link href="/dashboard" className="hover:text-foreground transition-colors">
                  RAG Workspace
                </Link>
              </li>
              <li>
                <Link href="/dashboard/web-loader" className="hover:text-foreground transition-colors">
                  Web Crawler
                </Link>
              </li>
              <li>
                <Link href="/dashboard/account" className="hover:text-foreground transition-colors">
                  API Key Vault
                </Link>
              </li>
              <li>
                <a href="#how-it-works" className="hover:text-foreground transition-colors">
                  How It Works
                </a>
              </li>
            </ul>
          </div>

          {/* Resources Links */}
          <div className="space-y-2.5">
            <span className="font-display font-semibold text-foreground tracking-wide block uppercase text-[11px]">
              Resources
            </span>
            <ul className="space-y-2 text-muted-foreground">
              <li>
                <a
                  href="https://github.com/Pradeepks01/PDF-AI"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-foreground transition-colors inline-flex items-center gap-1"
                >
                  <span>Documentation</span>
                  <ExternalLink className="size-3" />
                </a>
              </li>
              <li>
                <a
                  href="https://pinecone.io"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-foreground transition-colors inline-flex items-center gap-1"
                >
                  <span>Pinecone Vector DB</span>
                  <ExternalLink className="size-3" />
                </a>
              </li>
              <li>
                <a
                  href="https://ai.google.dev"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-foreground transition-colors inline-flex items-center gap-1"
                >
                  <span>Google Gemini AI</span>
                  <ExternalLink className="size-3" />
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/Pradeepks01/PDF-AI"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-foreground transition-colors inline-flex items-center gap-1"
                >
                  <span>GitHub Repository</span>
                  <ExternalLink className="size-3" />
                </a>
              </li>
            </ul>
          </div>

          {/* Legal / Privacy Links */}
          <div className="space-y-2.5">
            <span className="font-display font-semibold text-foreground tracking-wide block uppercase text-[11px]">
              Security &amp; Privacy
            </span>
            <ul className="space-y-2 text-muted-foreground">
              <li>100% Private (BYOK)</li>
              <li>Local Browser Vault</li>
              <li>Zero External Telemetry</li>
              <li>Open Source MIT/Apache</li>
            </ul>
          </div>
        </div>

        {/* Bottom Copyright */}
        <div className="max-w-7xl mx-auto pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-muted-foreground">
          <p>
            &copy; {new Date().getFullYear()} PDF AI. Built with Next.js 15, FastAPI, Pinecone &amp; Google Gemini.
          </p>
          <div className="flex items-center gap-4">
            <a href="#features" className="hover:text-foreground transition-colors">
              Features
            </a>
            <a href="#how-it-works" className="hover:text-foreground transition-colors">
              Workflow
            </a>
            <Link href="/dashboard" className="hover:text-foreground transition-colors">
              Dashboard
            </Link>
          </div>
        </div>
      </footer>
      </div>
    </div>
  )
}
