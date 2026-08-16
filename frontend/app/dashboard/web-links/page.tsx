"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Globe, ExternalLink, Sparkles, MessageSquare, Database } from "lucide-react";
import pythonAxios from "@/lib/python-axios";
import ChatComponent from "@/components/ChatComponent";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function WebLinksPage() {
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [crawledUrls, setCrawledUrls] = useState<string[]>([]);
  const [indexingUrl, setIndexingUrl] = useState<string | null>(null);

  // Chat modal state
  const [activeChatNamespace, setActiveChatNamespace] = useState<string | null>(null);
  const [activeChatTitle, setActiveChatTitle] = useState<string>("");

  const handleCrawl = async () => {
    if (!url) {
      toast.error("Please enter a URL");
      return;
    }

    setIsLoading(true);
    setCrawledUrls([]);

    try {
      const res = await pythonAxios.post('/api/web/crawl', {
        url,
        url_id: `link_${Date.now()}`
      });

      setCrawledUrls([url]);
      toast.success("Domain scraped and indexed into Pinecone!");
      setActiveChatTitle(url);
      setActiveChatNamespace(res.data.data.namespace);
    } catch (error: any) {
      console.error("Crawling error:", error);
      toast.error(error?.response?.data?.detail || "Failed to crawl URL");
    } finally {
      setIsLoading(false);
    }
  };

  const handleIndexAndChat = async (targetUrl: string) => {
    setIndexingUrl(targetUrl);
    try {
      const urlId = `url_${Date.now()}`;
      const res = await pythonAxios.post('/api/web/crawl', {
        url: targetUrl,
        url_id: urlId
      });

      toast.success(`Indexed ${targetUrl} into Pinecone!`);
      setActiveChatTitle(targetUrl);
      setActiveChatNamespace(res.data.data.namespace);
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || "Failed to index website URL");
    } finally {
      setIndexingUrl(null);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 max-w-5xl mx-auto w-full">
      <div className="flex items-center justify-between border-b border-border/60 pb-4">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center text-primary glow-ring">
            <Globe className="size-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold font-display text-foreground">Web Link Crawler &amp; RAG Assistant</h1>
            <p className="text-xs text-muted-foreground">Crawl website links, index web pages to Pinecone, and chat with Gemini 2.5 Flash</p>
          </div>
        </div>
      </div>

      <Card className="surface-panel border-border/80 rounded-2xl shadow-xl">
        <CardHeader>
          <CardTitle className="text-base font-display flex items-center gap-2">
            <Sparkles className="size-4 text-primary" />
            <span>Crawl &amp; Index Website URL</span>
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            Enter any website link to extract content, build 768-dim embeddings, and start chatting instantly.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-2.5">
            <Input
              type="url"
              placeholder="https://docs.pinecone.io/"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              disabled={isLoading}
              className="flex-1 text-sm rounded-xl border-border/80 bg-background/60"
            />
            <Button 
              onClick={handleCrawl} 
              disabled={isLoading || !url}
              className="bg-primary text-primary-foreground hover:opacity-90 min-w-[130px] rounded-xl font-display font-semibold text-xs h-10 glow-ring cursor-pointer"
            >
              {isLoading ? (
                <Loader2 className="size-4 animate-spin mr-1.5" />
              ) : (
                <Database className="size-4 mr-1.5" />
              )}
              {isLoading ? "Indexing..." : "Index & Chat"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {crawledUrls.length > 0 && (
        <Card className="surface-panel border-border/80 rounded-2xl shadow-xl">
          <CardHeader>
            <CardTitle className="text-base font-display">Indexed Web Pages ({crawledUrls.length})</CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Click &quot;Chat with AI&quot; to ask questions about any indexed website link.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2.5">
              {crawledUrls.map((crawledUrl, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3.5 border border-border/70 rounded-xl bg-card/60 hover:bg-card transition-colors"
                >
                  <span className="text-xs font-mono font-medium text-foreground truncate flex-1 mr-4">
                    {crawledUrl}
                  </span>
                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      size="sm"
                      onClick={() => handleIndexAndChat(crawledUrl)}
                      disabled={indexingUrl === crawledUrl}
                      className="bg-primary text-primary-foreground hover:opacity-90 gap-1.5 text-xs h-8 rounded-lg font-medium cursor-pointer"
                    >
                      {indexingUrl === crawledUrl ? (
                        <Loader2 className="size-3.5 animate-spin" />
                      ) : (
                        <MessageSquare className="size-3.5" />
                      )}
                      <span>Chat with AI</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(crawledUrl, '_blank')}
                      className="size-8 p-0 rounded-lg cursor-pointer"
                    >
                      <ExternalLink className="size-3.5 text-muted-foreground" />
                    </Button>
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
  );
}
