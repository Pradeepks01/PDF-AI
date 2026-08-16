'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Globe, MessageSquare, ExternalLink, Loader2, Sparkles, Database } from 'lucide-react'
import pythonAxios from '@/lib/python-axios'
import { toast } from 'sonner'
import ChatComponent from '@/components/ChatComponent'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

const WebPageLoader = () => {
  const [inputUrl, setInputUrl] = useState('')
  const [isIndexing, setIsIndexing] = useState(false)
  const [activeChatNamespace, setActiveChatNamespace] = useState<string | null>(null)
  const [activeChatTitle, setActiveChatTitle] = useState<string>('')

  // Local storage cache for indexed web pages
  const [indexedPages, setIndexedPages] = useState<Array<{ url: string; namespace: string; chunks: number; indexedAt: string }>>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('pdf_rag_indexed_web_pages')
      if (saved) {
        try {
          return JSON.parse(saved)
        } catch {
          return []
        }
      }
    }
    return []
  })

  const handleIndexUrl = async () => {
    if (!inputUrl) {
      toast.error('Please enter a valid website URL')
      return
    }

    setIsIndexing(true)
    try {
      const urlId = `web_${Date.now()}`
      const res = await pythonAxios.post('/api/web/crawl', {
        url: inputUrl,
        url_id: urlId
      })

      const newPage = {
        url: inputUrl,
        namespace: res.data.data.namespace,
        chunks: res.data.data.chunks_count || 1,
        indexedAt: new Date().toLocaleDateString()
      }

      const updated = [newPage, ...indexedPages]
      setIndexedPages(updated)
      if (typeof window !== 'undefined') {
        localStorage.setItem('pdf_rag_indexed_web_pages', JSON.stringify(updated))
      }

      toast.success('Website parsed, embedded, and indexed into Pinecone!')
      setActiveChatTitle(inputUrl)
      setActiveChatNamespace(res.data.data.namespace)
      setInputUrl('')
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || 'Failed to crawl and index website URL')
    } finally {
      setIsIndexing(false)
    }
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 max-w-5xl mx-auto w-full">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border/60 pb-4">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center text-primary glow-ring">
            <Globe className="size-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold font-display text-foreground">Web Page Loader &amp; Crawler</h1>
            <p className="text-xs text-muted-foreground">Scrape online articles, parse markdown, and index 768-dim vector embeddings into Pinecone</p>
          </div>
        </div>
      </div>

      {/* Index Input Card */}
      <Card className="surface-panel border-border/80 rounded-2xl shadow-xl">
        <CardHeader>
          <CardTitle className="text-base font-display flex items-center gap-2">
            <Sparkles className="size-4 text-primary" />
            <span>Load &amp; Index Live Web Page</span>
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            Enter any public URL or documentation link to extract text with Trafilatura and index vectors.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-2.5">
            <Input
              type="url"
              placeholder="https://en.wikipedia.org/wiki/Artificial_intelligence"
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              disabled={isIndexing}
              className="flex-1 text-sm rounded-xl border-border/80 bg-background/60"
            />
            <Button 
              onClick={handleIndexUrl} 
              disabled={isIndexing || !inputUrl}
              className="bg-primary text-primary-foreground hover:opacity-90 min-w-[140px] rounded-xl font-display font-semibold text-xs h-10 glow-ring cursor-pointer"
            >
              {isIndexing ? (
                <Loader2 className="size-4 animate-spin mr-1.5" />
              ) : (
                <Database className="size-4 mr-1.5" />
              )}
              {isIndexing ? "Vectorizing..." : "Index Web Page"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* List of Indexed Pages */}
      {indexedPages && indexedPages.length > 0 && (
        <Card className="surface-panel border-border/80 rounded-2xl shadow-xl">
          <CardHeader>
            <CardTitle className="text-base font-display flex items-center justify-between">
              <span>Indexed Web Resources ({indexedPages.length})</span>
              <span className="text-xs font-mono text-muted-foreground font-normal">Pinecone Namespaces</span>
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Click &quot;Chat with AI&quot; to execute grounded queries against any indexed webpage.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2.5">
              {indexedPages.map((page, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3.5 border border-border/70 rounded-xl bg-card/60 hover:bg-card transition-colors"
                >
                  <div className="flex items-center gap-2.5 min-w-0 mr-4">
                    <Globe className="size-4 text-primary shrink-0" />
                    <div className="truncate">
                      <span className="text-xs font-mono font-medium text-foreground truncate block">
                        {page.url}
                      </span>
                      <span className="text-[10px] text-muted-foreground font-mono">
                        ns: {page.namespace} • {page.chunks} chunk(s)
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      size="sm"
                      onClick={() => {
                        setActiveChatTitle(page.url || 'Web Page');
                        setActiveChatNamespace(page.namespace);
                      }}
                      className="bg-primary text-primary-foreground hover:opacity-90 gap-1.5 text-xs h-8 rounded-lg font-medium cursor-pointer"
                    >
                      <MessageSquare className="size-3.5" />
                      <span>Chat with AI</span>
                    </Button>
                    {page.url && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(page.url, '_blank')}
                        className="size-8 p-0 rounded-lg cursor-pointer"
                        title="Open webpage in new tab"
                      >
                        <ExternalLink className="size-3.5 text-muted-foreground" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* RAG Chat Dialog Modal */}
      <Dialog open={!!activeChatNamespace} onOpenChange={(open) => !open && setActiveChatNamespace(null)}>
        <DialogContent className="max-w-4xl h-[85vh] flex flex-col p-4 rounded-2xl bg-background border-border shadow-2xl">
          <DialogHeader className="border-b border-border/60 pb-2">
            <DialogTitle className="flex items-center gap-2 text-sm font-display">
              <Globe className="size-4 text-primary" />
              <span>Web RAG Chat: <span className="text-xs text-muted-foreground font-mono truncate max-w-sm inline-block">{activeChatTitle}</span></span>
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-hidden">
            {activeChatNamespace && <ChatComponent id={activeChatNamespace} />}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default WebPageLoader