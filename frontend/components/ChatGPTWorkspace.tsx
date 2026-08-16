'use client'

import React, { useState, useEffect, useRef } from 'react'
import { 
  Plus, MessageSquare, Trash2, Search, FileText, Upload, 
  Send, Sparkles, Paperclip, CheckCircle2, 
  Loader2, X, Download, Mic, MicOff, ChevronDown, ChevronUp,
  PanelLeftClose, PanelLeftOpen, Layers, ShieldCheck, Database
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import ReactMarkdown from 'react-markdown'
import pythonAxios from '@/lib/python-axios'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { 
  ChatSession, ChatMessage, AttachedPdf, 
  getChatSessions, createChatSession, 
  addMessageToSession, addPdfToSession, deleteChatSession 
} from '@/lib/chatStorage'

export default function ChatGPTWorkspace() {
  const [sessions, setSessions] = useState<ChatSession[]>([])
  const [activeSessionId, setActiveSessionId] = useState<string>('')
  const [searchQuery, setSearchQuery] = useState('')
  const [input, setInput] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [expandedSources, setExpandedSources] = useState<Record<string, boolean>>({})

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const recognitionRef = useRef<any>(null)

  // Load chat sessions on mount
  useEffect(() => {
    let loadedSessions = getChatSessions()
    
    // Normalize any legacy welcome messages
    loadedSessions = loadedSessions.map(s => ({
      ...s,
      messages: s.messages.map(m => {
        if (m.type === 'bot' && (m.text.includes('Multi-PDF ChatGPT RAG Assistant') || m.text.includes('Attach one or more PDF documents to this chat'))) {
          return { ...m, text: 'Hello! How can I help you today? Upload or attach PDF documents to ask questions, extract insights, and analyze content.' }
        }
        return m
      })
    }))

    if (loadedSessions.length === 0) {
      const defaultSession = createChatSession('Welcome Chat')
      setSessions([defaultSession])
      setActiveSessionId(defaultSession.id)
    } else {
      setSessions(loadedSessions)
      setActiveSessionId(loadedSessions[0].id)
      localStorage.setItem('pdf_rag_chat_sessions_v1', JSON.stringify(loadedSessions))
    }

    // Initialize Web Speech API for Voice Typing
    if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      const recognition = new SpeechRecognition()
      recognition.continuous = false
      recognition.interimResults = false
      recognition.lang = 'en-US'

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript
        setInput(prev => (prev ? `${prev} ${transcript}` : transcript))
        setIsListening(false)
        toast.success('Voice input transcribed!')
      }

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error)
        setIsListening(false)
        toast.error('Voice input error. Please try again.')
      }

      recognition.onend = () => {
        setIsListening(false)
      }

      recognitionRef.current = recognition
    }
  }, [])

  const currentSession = sessions.find(s => s.id === activeSessionId) || sessions[0]

  // Scroll to bottom when messages update
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [currentSession?.messages])

  // Toggle Voice Input
  const toggleVoiceInput = () => {
    if (!recognitionRef.current) {
      toast.error('Speech recognition is not supported in this browser.')
      return
    }

    if (isListening) {
      recognitionRef.current.stop()
      setIsListening(false)
    } else {
      try {
        recognitionRef.current.start()
        setIsListening(true)
        toast.info('Listening... Speak your question now.')
      } catch (err) {
        console.error(err)
      }
    }
  }

  // Toggle Sources expansion
  const toggleSourceView = (msgId: string) => {
    setExpandedSources(prev => ({
      ...prev,
      [msgId]: !prev[msgId]
    }))
  }

  // Handle Export Chat as Markdown
  const handleExportChat = () => {
    if (!currentSession || currentSession.messages.length === 0) {
      toast.error('No chat history to export')
      return
    }

    let markdown = `# ${currentSession.title}\n`
    markdown += `**Session ID:** ${currentSession.id}\n`
    markdown += `**Exported At:** ${new Date().toLocaleString()}\n`
    markdown += `**Attached Documents:** ${currentSession.attachedPdfs?.map(p => p.filename).join(', ') || 'None'}\n\n`
    markdown += `---\n\n`

    currentSession.messages.forEach((msg) => {
      const role = msg.type === 'user' ? '👤 User' : '🤖 PDF AI RAG Studio'
      markdown += `### ${role}\n${msg.text}\n\n`
      if (msg.sources && msg.sources.length > 0) {
        markdown += `*Sources Cited:*\n`
        msg.sources.forEach((src: any) => {
          const name = src.metadata?.filename || src.metadata?.source_url || 'Doc'
          const page = src.metadata?.page_number ? ` (Page ${src.metadata.page_number})` : ''
          const matchScore = src.score ? ` - Match: ${(src.score * 100).toFixed(1)}%` : ''
          markdown += `- **${name}${page}**${matchScore}\n`
        })
        markdown += `\n`
      }
    })

    const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `${currentSession.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_rag_notes.md`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success('Exported chat research notes as Markdown file!')
  }

  // Handle creating a new chat
  const handleNewChat = () => {
    const newSession = createChatSession('New Chat')
    setSessions(getChatSessions())
    setActiveSessionId(newSession.id)
    toast.success('Started new chat session')
  }

  // Handle deleting a chat
  const handleDeleteChat = (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    const updated = deleteChatSession(id)
    setSessions(updated)
    if (activeSessionId === id) {
      if (updated.length > 0) {
        setActiveSessionId(updated[0].id)
      } else {
        const fresh = createChatSession('New Chat')
        setSessions([fresh])
        setActiveSessionId(fresh.id)
      }
    }
    toast.success('Chat deleted')
  }

  // RAG Query Mutation
  const chatMutation = useMutation({
    mutationFn: async (query: string) => {
      if (!currentSession) throw new Error('No active session')
      const response = await pythonAxios.post('/api/chat', {
        query,
        collection_id: currentSession.id,
        top_k: 4
      })
      return response.data.data
    },
    onMutate: async (userQuery: string) => {
      if (!currentSession) return

      // Add User Message
      const userMsg: ChatMessage = {
        id: `msg_user_${Date.now()}`,
        type: 'user',
        text: userQuery,
        timestamp: new Date().toISOString()
      }
      const updatedAfterUser = addMessageToSession(currentSession.id, userMsg)
      if (updatedAfterUser) setSessions(getChatSessions())

      // Add Bot Thinking Message
      const thinkingMsg: ChatMessage = {
        id: `msg_thinking_${Date.now()}`,
        type: 'bot',
        text: '__GENERATING__',
        timestamp: new Date().toISOString()
      }
      addMessageToSession(currentSession.id, thinkingMsg)
      setSessions(getChatSessions())
    },
    onSuccess: (data) => {
      if (!currentSession) return
      const aiResponseText = data.response

      // Replace thinking message with actual response & sources
      const latestSessions = getChatSessions()
      const sess = latestSessions.find(s => s.id === currentSession.id)
      if (sess) {
        sess.messages[sess.messages.length - 1] = {
          id: `msg_bot_${Date.now()}`,
          type: 'bot',
          text: aiResponseText,
          timestamp: new Date().toISOString(),
          sources: data.sources || []
        }
        setSessions(latestSessions)
        localStorage.setItem('pdf_rag_chat_sessions_v1', JSON.stringify(latestSessions))
      }
    },
    onError: (err: any) => {
      console.error(err)
      toast.error(err?.response?.data?.detail || 'Failed to query Pinecone & Gemini')
      
      // Remove thinking message on error
      const latest = getChatSessions()
      const sess = latest.find(s => s.id === currentSession?.id)
      if (sess) {
        sess.messages.pop()
        setSessions(latest)
        localStorage.setItem('pdf_rag_chat_sessions_v1', JSON.stringify(latest))
      }
    }
  })

  const handleSend = () => {
    if (!input.trim() || chatMutation.isPending || !currentSession) return
    const text = input.trim()
    setInput('')
    chatMutation.mutate(text)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  // Handle Multi-PDF Upload
  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0 || !currentSession) return

    setIsUploading(true)
    let uploadCount = 0

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      if (!file.name.endsWith('.pdf')) {
        toast.error(`${file.name} is not a PDF file`)
        continue
      }

      try {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('collection_id', currentSession.id)

        const res = await pythonAxios.post('/api/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })

        const pdfMeta: AttachedPdf = {
          filename: file.name,
          chunksCount: res.data.data.chunks_count,
          vectorsUpserted: res.data.data.vectors_upserted,
          uploadedAt: new Date().toISOString()
        }

        addPdfToSession(currentSession.id, pdfMeta)
        uploadCount++
      } catch (err: any) {
        console.error(err)
        toast.error(`Failed to index ${file.name}`)
      }
    }

    setIsUploading(false)
    setShowUploadModal(false)
    setSessions(getChatSessions())
    if (uploadCount > 0) {
      toast.success(`Successfully indexed ${uploadCount} PDF(s) into Pinecone!`)
    }
  }

  const filteredSessions = sessions.filter(s => 
    s.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const isInitialState = !currentSession?.messages || currentSession.messages.length <= 1

  return (
    <div className="flex h-full w-full overflow-hidden bg-background text-foreground">
      {/* ---------------- LEFT CHATGPT SIDEBAR ---------------- */}
      <aside className={`transition-all duration-300 ease-in-out flex flex-col border-r border-border/70 bg-card/60 backdrop-blur-md flex-shrink-0 ${isSidebarOpen ? 'w-72' : 'w-0 overflow-hidden'}`}>
        {/* New Chat Button */}
        <div className="p-3">
          <Button 
            onClick={handleNewChat}
            className="w-full bg-primary text-primary-foreground hover:opacity-90 font-display font-semibold justify-start gap-2 shadow-xs rounded-xl h-10 text-xs glow-ring cursor-pointer"
          >
            <Plus className="size-4" />
            <span>New Chat Session</span>
          </Button>
        </div>

        {/* Search Bar */}
        <div className="px-3 pb-2">
          <div className="relative">
            <Search className="size-3.5 absolute left-3 top-2.5 text-muted-foreground" />
            <Input 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search conversations..."
              className="pl-8 bg-background/60 border-border/80 text-xs h-8 rounded-lg"
            />
          </div>
        </div>

        {/* Saved Chat Sessions List */}
        <div className="flex-1 overflow-y-auto px-2 py-1 space-y-1">
          {filteredSessions.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-6">No chats found</p>
          ) : (
            filteredSessions.map((session) => {
              const isActive = session.id === activeSessionId
              const pdfCount = session.attachedPdfs?.length || 0

              return (
                <div
                  key={session.id}
                  onClick={() => setActiveSessionId(session.id)}
                  className={`group relative flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs cursor-pointer transition-all ${
                    isActive 
                      ? 'bg-primary/15 text-foreground font-semibold border border-primary/30 shadow-xs' 
                      : 'text-muted-foreground hover:bg-card hover:text-foreground border border-transparent'
                  }`}
                >
                  <MessageSquare className={`size-3.5 shrink-0 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
                  
                  <div className="flex-1 min-w-0 pr-5">
                    <p className="truncate text-xs font-medium">{session.title}</p>
                    <p className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5 font-mono">
                      {pdfCount > 0 ? (
                        <span className="text-primary font-medium flex items-center gap-0.5">
                          <FileText className="size-3" /> {pdfCount} PDF{pdfCount > 1 ? 's' : ''}
                        </span>
                      ) : (
                        <span>0 PDFs</span>
                      )}
                    </p>
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => handleDeleteChat(e, session.id)}
                    className="opacity-0 group-hover:opacity-100 absolute right-1 hover:bg-destructive/15 text-muted-foreground hover:text-destructive size-6 rounded-md cursor-pointer"
                  >
                    <Trash2 className="size-3" />
                  </Button>
                </div>
              )
            })
          )}
        </div>

        {/* Sidebar Footer Info */}
        <div className="p-3 border-t border-border/60 bg-card/40 text-xs text-muted-foreground flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Sparkles className="size-3.5 text-primary" />
            <span className="font-medium text-[11px] text-foreground font-display">Pinecone + Gemini</span>
          </div>
          <span className="text-[9px] bg-primary/15 text-primary px-1.5 py-0.5 rounded border border-primary/30 font-mono font-semibold">
            768-dim SOTA
          </span>
        </div>
      </aside>

      {/* ---------------- MAIN CHATGPT WORKSPACE ---------------- */}
      <div className="flex-1 flex flex-col h-full bg-background overflow-hidden min-w-0">
        {/* Workspace Top Header */}
        <div className="p-2.5 px-4 border-b border-border/60 flex items-center justify-between bg-card/30 backdrop-blur-xs">
          <div className="flex items-center gap-2.5 min-w-0">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="size-8 text-muted-foreground hover:text-foreground shrink-0 cursor-pointer rounded-lg"
              title={isSidebarOpen ? "Hide chat history" : "Show chat history"}
            >
              {isSidebarOpen ? <PanelLeftClose className="size-4" /> : <PanelLeftOpen className="size-4" />}
            </Button>
            <h2 className="font-display font-semibold text-sm truncate max-w-sm sm:max-w-md text-foreground">
              {currentSession?.title || 'RAG Chat Workspace'}
            </h2>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button 
              variant="outline"
              size="sm"
              onClick={handleExportChat}
              className="text-xs h-8 gap-1.5 px-2.5 rounded-lg border-border/80 hover:bg-card cursor-pointer"
            >
              <Download className="size-3.5 text-primary" />
              <span className="hidden sm:inline">Export Notes (.md)</span>
            </Button>

            <Button 
              onClick={() => setShowUploadModal(true)}
              className="bg-primary text-primary-foreground hover:opacity-90 gap-1.5 text-xs h-8 px-3 rounded-lg font-medium glow-ring cursor-pointer"
            >
              <Paperclip className="size-3.5" />
              <span>Attach PDFs ({currentSession?.attachedPdfs?.length || 0})</span>
            </Button>
          </div>
        </div>

        {/* Attached PDF Pills Bar */}
        {currentSession?.attachedPdfs && currentSession.attachedPdfs.length > 0 && (
          <div className="px-4 py-2 bg-card/60 border-b border-border/60 flex items-center gap-2 flex-wrap">
            <span className="text-xs font-semibold text-primary flex items-center gap-1">
              <FileText className="size-3.5" /> Active PDF Context ({currentSession.attachedPdfs.length}):
            </span>
            {currentSession.attachedPdfs.map((pdf, idx) => (
              <span 
                key={idx}
                className="text-xs bg-background/80 border border-primary/30 text-foreground px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-xs"
              >
                <CheckCircle2 className="size-3 text-primary" />
                <span className="font-medium max-w-[180px] truncate">{pdf.filename}</span>
                <span className="text-[10px] text-muted-foreground font-mono">({pdf.vectorsUpserted} vectors)</span>
              </span>
            ))}
          </div>
        )}

        {/* Message Feed */}
        <div className="flex-1 overflow-hidden p-4">
          <ScrollArea className="h-full pr-4">
            <div className="space-y-6 max-w-3xl mx-auto py-2">
              
              {/* Empty state prompt starters */}
              {isInitialState && (
                <div className="pt-8 pb-4 text-center space-y-6">
                  <div className="size-12 rounded-2xl bg-primary/15 text-primary mx-auto flex items-center justify-center glow-ring">
                    <Sparkles className="size-6" />
                  </div>
                  <div className="space-y-2 max-w-md mx-auto">
                    <h3 className="font-display font-bold text-lg text-foreground">
                      Ask Grounded Questions with SOTA RAG
                    </h3>
                    <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                      Attach PDFs or explore query examples below to test HyDE query expansion, RRF rank fusion, and verified evidence spotlighting.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left max-w-xl mx-auto pt-2">
                    <button
                      onClick={() => setInput('Summarize the key findings, conclusions, and takeaways from the attached documents in detail.')}
                      className="p-3 rounded-xl border border-border/80 bg-card/60 hover:border-primary/40 hover:bg-card text-left transition-all group cursor-pointer"
                    >
                      <div className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors flex items-center gap-1.5">
                        <FileText className="size-3.5 text-primary" />
                        <span>Summarize Key Insights</span>
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-1 line-clamp-2">
                        Extract executive summaries, findings, and methodologies.
                      </p>
                    </button>

                    <button
                      onClick={() => setInput('What are the critical terms, liability obligations, and termination clauses specified in these documents?')}
                      className="p-3 rounded-xl border border-border/80 bg-card/60 hover:border-primary/40 hover:bg-card text-left transition-all group cursor-pointer"
                    >
                      <div className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors flex items-center gap-1.5">
                        <ShieldCheck className="size-3.5 text-primary" />
                        <span>Extract Clauses &amp; Terms</span>
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-1 line-clamp-2">
                        Inspect legal indemnities, terms, and obligations with citations.
                      </p>
                    </button>

                    <button
                      onClick={() => setInput('Compare and contrast the primary figures, metrics, and data points across the uploaded sources.')}
                      className="p-3 rounded-xl border border-border/80 bg-card/60 hover:border-primary/40 hover:bg-card text-left transition-all group cursor-pointer"
                    >
                      <div className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors flex items-center gap-1.5">
                        <Database className="size-3.5 text-primary" />
                        <span>Compare Data Across Files</span>
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-1 line-clamp-2">
                        Synthesize multi-document comparisons and data tables.
                      </p>
                    </button>

                    <button
                      onClick={() => setInput('What are the required action items, deadlines, and technical recommendations mentioned?')}
                      className="p-3 rounded-xl border border-border/80 bg-card/60 hover:border-primary/40 hover:bg-card text-left transition-all group cursor-pointer"
                    >
                      <div className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors flex items-center gap-1.5">
                        <Layers className="size-3.5 text-primary" />
                        <span>Action Items &amp; Next Steps</span>
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-1 line-clamp-2">
                        Extract actionable checklists and technical milestones.
                      </p>
                    </button>
                  </div>
                </div>
              )}

              {/* Chat Messages */}
              {currentSession?.messages?.map((msg) => (
                <div 
                  key={msg.id}
                  className={`flex flex-col ${msg.type === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div className="flex items-start gap-3 max-w-[90%] sm:max-w-[82%]">
                    <div 
                      className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                        msg.type === 'user'
                          ? 'bg-primary text-primary-foreground font-medium shadow-sm'
                          : 'bg-card border border-border/80 text-foreground shadow-sm'
                      }`}
                    >
                      {msg.text === '__GENERATING__' || msg.id.startsWith('msg_thinking_') || msg.text.includes('Performing Multi-Query Expansion') ? (
                        <div className="flex items-center gap-2.5 py-1 px-1 text-sm font-medium text-foreground">
                          <div className="relative flex items-center justify-center">
                            <Sparkles className="size-4 text-primary animate-spin" />
                          </div>
                          <span className="text-xs text-muted-foreground">Generating</span>
                          <span className="flex gap-1 items-center">
                            <span className="size-1.5 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]" />
                            <span className="size-1.5 bg-primary/70 rounded-full animate-bounce [animation-delay:-0.15s]" />
                            <span className="size-1.5 bg-primary/40 rounded-full animate-bounce" />
                          </span>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div className="prose dark:prose-invert max-w-none text-sm leading-relaxed">
                            <ReactMarkdown>{msg.text}</ReactMarkdown>
                          </div>

                          {/* Sources Cited Section */}
                          {msg.sources && msg.sources.length > 0 && (
                            <div className="pt-2.5 mt-2.5 border-t border-border/50 text-xs">
                              <button
                                onClick={() => toggleSourceView(msg.id)}
                                className="flex items-center gap-1.5 text-primary font-semibold hover:underline cursor-pointer"
                              >
                                <FileText className="size-3.5" />
                                <span>{msg.sources.length} Grounded Source Citation{msg.sources.length > 1 ? 's' : ''}</span>
                                {expandedSources[msg.id] ? <ChevronUp className="size-3" /> : <ChevronDown className="size-3" />}
                              </button>

                              {expandedSources[msg.id] && (
                                <div className="mt-2.5 space-y-2">
                                  {msg.sources.map((src: any, sIdx: number) => {
                                    const filename = src.metadata?.filename || src.metadata?.source_url || `Source #${sIdx + 1}`
                                    const pageNum = src.metadata?.page_number ? ` (Page ${src.metadata.page_number})` : ''
                                    const matchPercent = src.score ? `${(src.score * 100).toFixed(1)}% match` : 'Relevant'
                                    const snippet = src.metadata?.text || ''

                                    return (
                                      <div key={sIdx} className="p-2.5 rounded-xl bg-background/80 border border-border/70 text-[11px] space-y-1">
                                        <div className="flex items-center justify-between font-mono font-medium text-foreground">
                                          <span className="truncate max-w-[240px] text-primary">{filename}{pageNum}</span>
                                          <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded">{matchPercent}</span>
                                        </div>
                                        {snippet && (
                                          <p className="text-muted-foreground line-clamp-3 italic">
                                            &ldquo;{snippet}&rdquo;
                                          </p>
                                        )}
                                      </div>
                                    )
                                  })}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
        </div>

        {/* Input Bar & Suggestion Pills */}
        <div className="p-4 border-t border-border/60 bg-background">
          <div className="max-w-3xl mx-auto space-y-3">
            {/* Quick Prompt Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar text-xs">
              <span className="text-[11px] text-muted-foreground shrink-0 font-mono">Suggestions:</span>
              <button 
                onClick={() => setInput('Summarize all attached PDF documents in detail.')}
                className="bg-card hover:bg-card/80 px-3 py-1 rounded-full border border-border/70 text-foreground whitespace-nowrap transition cursor-pointer"
              >
                📝 Summarize attached PDFs
              </button>
              <button 
                onClick={() => setInput('What are the key skills, qualifications, and marks listed in these documents?')}
                className="bg-card hover:bg-card/80 px-3 py-1 rounded-full border border-border/70 text-foreground whitespace-nowrap transition cursor-pointer"
              >
                🎯 Key skills &amp; scores
              </button>
              <button 
                onClick={() => setInput('Compare the main points and obligations across the uploaded files.')}
                className="bg-card hover:bg-card/80 px-3 py-1 rounded-full border border-border/70 text-foreground whitespace-nowrap transition cursor-pointer"
              >
                🔍 Compare documents
              </button>
            </div>

            {/* Input Form */}
            <div className="flex gap-2 items-end">
              <Textarea 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask any grounded question across all attached PDFs..."
                className="flex-1 min-h-[52px] max-h-[160px] resize-none rounded-xl border-border/80 bg-card/60 focus-visible:ring-primary text-sm"
                rows={2}
              />

              <Button
                variant={isListening ? "destructive" : "outline"}
                size="icon"
                onClick={toggleVoiceInput}
                className={`size-[52px] rounded-xl shrink-0 cursor-pointer ${isListening ? 'animate-pulse' : 'border-border/80 hover:bg-card'}`}
                title={isListening ? "Stop Voice Typing" : "Start Voice Typing"}
              >
                {isListening ? <MicOff className="size-5" /> : <Mic className="size-5 text-muted-foreground" />}
              </Button>

              <Button 
                onClick={handleSend}
                disabled={!input.trim() || chatMutation.isPending}
                className="bg-primary text-primary-foreground hover:opacity-90 font-semibold h-[52px] px-5 rounded-xl gap-1.5 glow-ring cursor-pointer disabled:opacity-50"
              >
                {chatMutation.isPending ? (
                  <Loader2 className="size-5 animate-spin" />
                ) : (
                  <>
                    <span>Send</span>
                    <Send className="size-4" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* ---------------- MULTI-PDF UPLOAD MODAL DIALOG ---------------- */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-card border border-border/80 rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl relative animate-in fade-in zoom-in-95">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowUploadModal(false)}
              className="absolute right-4 top-4 text-muted-foreground hover:text-foreground size-8 rounded-lg cursor-pointer"
            >
              <X className="size-5" />
            </Button>

            <div className="space-y-1">
              <h3 className="text-lg sm:text-xl font-bold font-display flex items-center gap-2 text-foreground">
                <Paperclip className="size-5 text-primary" />
                <span>Attach PDFs to Current Chat</span>
              </h3>
              <p className="text-xs text-muted-foreground">
                Select 1 or multiple PDF files. All documents will be vectorized into Pinecone under this session&apos;s namespace.
              </p>
            </div>

            <div className="border-2 border-dashed border-border hover:border-primary/60 rounded-xl p-8 text-center transition-colors bg-background/50">
              <Upload className="size-10 mx-auto text-primary mb-3" />
              <label htmlFor="multi-pdf-upload" className="cursor-pointer space-y-1 block">
                <p className="text-sm font-semibold text-primary hover:underline">
                  Click to choose PDF files or drag &amp; drop
                </p>
                <p className="text-xs text-muted-foreground font-mono">High-throughput 768-dim batch vectorizer</p>
              </label>
              <input 
                id="multi-pdf-upload"
                type="file"
                accept=".pdf"
                multiple
                onChange={handlePdfUpload}
                disabled={isUploading}
                className="hidden"
              />
            </div>

            {isUploading && (
              <div className="text-center p-4 border border-primary/30 rounded-xl bg-primary/10 text-primary flex items-center justify-center gap-2">
                <Loader2 className="size-4 animate-spin text-primary" />
                <span className="text-xs font-medium">Batch embedding text &amp; upserting vectors into Pinecone...</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
