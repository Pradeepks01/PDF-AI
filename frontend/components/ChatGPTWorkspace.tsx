'use client'

import React, { useState, useEffect, useRef } from 'react'
import { 
  Plus, MessageSquare, Trash2, Search, FileText, Upload, 
  Send, Sparkles, Paperclip, CheckCircle2, 
  Loader2, X, Download, Mic, MicOff, ChevronDown, ChevronUp,
  PanelLeftClose, PanelLeftOpen, Layers, ShieldCheck, Database,
  KeyRound, AlertTriangle, ExternalLink
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import ReactMarkdown from 'react-markdown'
import pythonAxios from '@/lib/python-axios'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useSession } from 'next-auth/react'
import { 
  ChatSession, ChatMessage, AttachedPdf, 
  getChatSessions, saveChatSessions, createChatSession, 
  addMessageToSession, addPdfToSession, deleteChatSession 
} from '@/lib/chatStorage'

export default function ChatGPTWorkspace() {
  const { data: authSession } = useSession()
  const userEmail = authSession?.user?.email || ''

  const [sessions, setSessions] = useState<ChatSession[]>([])
  const [activeSessionId, setActiveSessionId] = useState<string>('')
  const [searchQuery, setSearchQuery] = useState('')
  const [input, setInput] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [expandedSources, setExpandedSources] = useState<Record<string, boolean>>({})

  // API Key Gating States
  const [hasApiKey, setHasApiKey] = useState(true)
  const [showApiKeyModal, setShowApiKeyModal] = useState(false)
  const [geminiKeyInput, setGeminiKeyInput] = useState('')
  const [pineconeKeyInput, setPineconeKeyInput] = useState('')

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const recognitionRef = useRef<any>(null)

  // Check API keys on mount or when auth changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const gKey = localStorage.getItem('custom_gemini_key') || ''
      const pKey = localStorage.getItem('custom_pinecone_key') || ''
      setGeminiKeyInput(gKey)
      setPineconeKeyInput(pKey)

      const keyConfigured = Boolean(gKey.trim())
      setHasApiKey(keyConfigured)
      if (!keyConfigured) {
        setShowApiKeyModal(true)
      }
    }
  }, [userEmail])

  // Load chat sessions on mount and when user email changes
  useEffect(() => {
    let loadedSessions = getChatSessions(userEmail)
    
    // Purge any __GENERATING__ placeholder messages completely from state and storage
    loadedSessions = loadedSessions.map(s => ({
      ...s,
      messages: s.messages.filter(m => m.text && m.text !== '__GENERATING__').map(m => {
        if (m.type === 'bot' && (m.text.includes('Multi-PDF ChatGPT RAG Assistant') || m.text.includes('Attach one or more PDF documents to this chat'))) {
          return { ...m, text: 'Hello! How can I help you today? Upload or attach PDF documents to ask questions, extract insights, and analyze content.' }
        }
        return m
      })
    }))

    saveChatSessions(loadedSessions, userEmail)

    if (loadedSessions.length === 0) {
      const defaultSession = createChatSession('Welcome Chat', userEmail)
      setSessions([defaultSession])
      setActiveSessionId(defaultSession.id)
    } else {
      setSessions(loadedSessions)
      setActiveSessionId(loadedSessions[0].id)
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
  }, [userEmail])

  const fallbackSession: ChatSession = {
    id: 'default',
    title: 'New Chat',
    createdAt: new Date().toISOString(),
    messages: [],
    attachedPdfs: []
  }

  const currentSession = sessions.find(s => s.id === activeSessionId) || sessions[0] || fallbackSession

  // Scroll to bottom when messages update
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [currentSession?.messages])

  // Save API Keys from Modal
  const handleSaveApiKeys = (e: React.FormEvent) => {
    e.preventDefault()
    if (!geminiKeyInput.trim()) {
      toast.error('Google Gemini API Key is required to chat.')
      return
    }

    localStorage.setItem('custom_gemini_key', geminiKeyInput.trim())
    if (pineconeKeyInput.trim()) {
      localStorage.setItem('custom_pinecone_key', pineconeKeyInput.trim())
    }
    
    setHasApiKey(true)
    setShowApiKeyModal(false)
    toast.success('API Keys configured! You can now upload PDFs and chat.')
  }

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
    markdown += `**User Account:** ${userEmail || 'Guest'}\n`
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
    const newSession = createChatSession('New Chat', userEmail)
    setSessions(getChatSessions(userEmail))
    setActiveSessionId(newSession.id)
    toast.success('Started new chat session')
  }

  // Handle deleting a chat
  const handleDeleteChat = (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    const updated = deleteChatSession(id, userEmail)
    setSessions(updated)
    if (activeSessionId === id) {
      if (updated.length > 0) {
        setActiveSessionId(updated[0].id)
      } else {
        const fresh = createChatSession('New Chat', userEmail)
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
      addMessageToSession(currentSession.id, userMsg, userEmail)
      setSessions(getChatSessions(userEmail))
    },
    onSuccess: (data) => {
      if (!currentSession) return
      const aiResponseText = data.response

      // Add Bot Message with Sources
      const botMsg: ChatMessage = {
        id: `msg_bot_${Date.now()}`,
        type: 'bot',
        text: aiResponseText,
        timestamp: new Date().toISOString(),
        sources: data.sources || []
      }
      addMessageToSession(currentSession.id, botMsg, userEmail)
      setSessions(getChatSessions(userEmail))
    },
    onError: (err: any) => {
      console.error(err)
      toast.error(err?.response?.data?.detail || 'Failed to query Pinecone & Gemini')
      
      if (currentSession) {
        const errorMsg: ChatMessage = {
          id: `msg_bot_err_${Date.now()}`,
          type: 'bot',
          text: `⚠️ **Unable to process query.** ${err?.response?.data?.detail || 'Please verify your Google Gemini API Key and Pinecone index in Settings.'}`,
          timestamp: new Date().toISOString()
        }
        addMessageToSession(currentSession.id, errorMsg, userEmail)
        setSessions(getChatSessions(userEmail))
      }
    }
  })

  // Handle Multi-PDF Upload
  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0 || !currentSession) return

    if (!hasApiKey) {
      setShowApiKeyModal(true)
      toast.error('Please configure your API keys before uploading documents.')
      return
    }

    setIsUploading(true)
    const toastId = toast.loading(`Vectorizing ${files.length} PDF(s) into Pinecone...`)

    try {
      const formData = new FormData()
      for (let i = 0; i < files.length; i++) {
        formData.append('files', files[i])
      }
      formData.append('collection_id', currentSession.id)

      const response = await pythonAxios.post('/api/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })

      const results = response.data.results || []
      
      // Update session with all uploaded PDFs
      results.forEach((res: any) => {
        if (res.status === 'success') {
          addPdfToSession(currentSession.id, {
            filename: res.filename,
            chunksCount: res.chunks_count,
            vectorsUpserted: res.vectors_upserted,
            uploadedAt: new Date().toISOString()
          }, userEmail)
        }
      })

      // Add system bot message listing attached documents
      const successCount = results.filter((r: any) => r.status === 'success').length
      const filenames = results.filter((r: any) => r.status === 'success').map((r: any) => r.filename).join(', ')

      const sysMessage: ChatMessage = {
        id: `msg_sys_${Date.now()}`,
        type: 'bot',
        text: `✅ **Successfully indexed ${successCount} PDF document(s):** \`${filenames}\`.\n\nYou can now ask grounded questions, summarize clauses, or compare specific details.`,
        timestamp: new Date().toISOString()
      }

      addMessageToSession(currentSession.id, sysMessage, userEmail)
      setSessions(getChatSessions(userEmail))

      toast.success(`Indexed ${successCount} PDF(s) into Pinecone!`, { id: toastId })
      setShowUploadModal(false)
    } catch (err: any) {
      console.error(err)
      toast.error(err?.response?.data?.detail || 'Failed to vectorize and upload PDFs', { id: toastId })
    } finally {
      setIsUploading(false)
      e.target.value = ''
    }
  }

  // Handle Send Message
  const handleSend = () => {
    if (!input.trim()) return

    if (!hasApiKey) {
      setShowApiKeyModal(true)
      toast.error('API Key required. Please enter your Google Gemini API Key to chat.')
      return
    }

    const query = input.trim()
    setInput('')
    chatMutation.mutate(query)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  // Filtered Sessions for search
  const filteredSessions = sessions.filter(s => 
    s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.attachedPdfs?.some(p => p.filename.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  return (
    <div className="flex h-full w-full overflow-hidden bg-background text-foreground relative">
      
      {/* ---------------- LEFT CHAT HISTORY SIDEBAR ---------------- */}
      <div 
        className={`border-r border-border/80 bg-sidebar flex flex-col transition-all duration-300 ease-in-out shrink-0 z-20 ${
          isSidebarOpen ? 'w-72 sm:w-80' : 'w-0 overflow-hidden border-r-0'
        }`}
      >
        {/* Sidebar Header & New Chat Button */}
        <div className="p-3 border-b border-border/60 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground font-mono">
              Chats &amp; Sessions
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSidebarOpen(false)}
              className="size-7 text-muted-foreground hover:text-foreground"
              title="Close Chat History"
            >
              <PanelLeftClose className="size-4" />
            </Button>
          </div>

          <Button 
            onClick={handleNewChat}
            className="w-full bg-primary text-primary-foreground hover:opacity-90 font-medium text-xs h-9 rounded-xl gap-2 cursor-pointer shadow-xs"
          >
            <Plus className="size-4" />
            <span>New Chat Session</span>
          </Button>

          {/* Search Chats Input */}
          <div className="relative">
            <Search className="size-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input 
              placeholder="Search chat history..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-8 pl-8 text-xs bg-card/50 border-border/80 rounded-lg focus-visible:ring-primary"
            />
          </div>
        </div>

        {/* Sessions List */}
        <ScrollArea className="flex-1 px-2 py-2">
          <div className="space-y-1">
            {filteredSessions.map((session) => {
              const isActive = session.id === activeSessionId
              const pdfCount = session.attachedPdfs?.length || 0

              return (
                <div
                  key={session.id}
                  onClick={() => setActiveSessionId(session.id)}
                  className={`group relative flex items-center justify-between p-2.5 rounded-xl text-xs cursor-pointer transition-all border ${
                    isActive 
                      ? 'bg-primary/15 text-primary border-primary/30 font-medium' 
                      : 'border-transparent text-muted-foreground hover:bg-card/70 hover:text-foreground'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0 pr-6">
                    <MessageSquare className={`size-4 shrink-0 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
                    <div className="flex flex-col min-w-0">
                      <span className="truncate">{session.title}</span>
                      {pdfCount > 0 && (
                        <span className="text-[10px] text-muted-foreground flex items-center gap-1 font-mono">
                          <FileText className="size-2.5" />
                          {pdfCount} PDF{pdfCount > 1 ? 's' : ''} attached
                        </span>
                      )}
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => handleDeleteChat(e, session.id)}
                    className="opacity-0 group-hover:opacity-100 size-6 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded transition-opacity absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer"
                    title="Delete Chat"
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              )
            })}
          </div>
        </ScrollArea>

        {/* Sidebar Footer Info */}
        <div className="p-3 border-t border-border/60 bg-card/30 flex items-center justify-between text-[11px] text-muted-foreground font-mono">
          <span className="truncate max-w-[160px]">{userEmail || 'Guest Workspace'}</span>
          <span className="bg-primary/10 text-primary px-1.5 py-0.5 rounded text-[10px] font-semibold">BYOK RAG</span>
        </div>
      </div>

      {/* ---------------- MAIN CHAT CANVAS ---------------- */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden bg-background">
        
        {/* Workspace Top Toolbar */}
        <div className="h-12 border-b border-border/60 px-4 flex items-center justify-between bg-card/40 shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            {!isSidebarOpen && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsSidebarOpen(true)}
                className="size-8 text-muted-foreground hover:text-foreground mr-1"
                title="Open Chat History"
              >
                <PanelLeftOpen className="size-4" />
              </Button>
            )}

            <div className="flex items-center gap-2 min-w-0">
              <span className="font-semibold text-xs sm:text-sm text-foreground truncate max-w-[200px] sm:max-w-xs">
                {currentSession?.title || 'Active Chat'}
              </span>
              {currentSession?.attachedPdfs && currentSession.attachedPdfs.length > 0 && (
                <span className="hidden sm:inline-flex items-center gap-1 text-[10px] bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded-full font-mono font-medium">
                  <Layers className="size-3" />
                  {currentSession.attachedPdfs.length} Document Context
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* API Key Status Pill */}
            <button
              onClick={() => setShowApiKeyModal(true)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border transition cursor-pointer ${
                hasApiKey 
                  ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30 hover:bg-emerald-500/20' 
                  : 'bg-amber-500/10 text-amber-500 border-amber-500/30 hover:bg-amber-500/20 animate-pulse'
              }`}
              title="Click to view or edit your personal API keys"
            >
              <KeyRound className="size-3" />
              <span>{hasApiKey ? 'Keys Connected' : 'Setup API Keys'}</span>
            </button>

            {/* Attach PDF Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (!hasApiKey) {
                  setShowApiKeyModal(true)
                  toast.error('Please configure API keys first.')
                } else {
                  setShowUploadModal(true)
                }
              }}
              className="h-8 text-xs gap-1.5 border-border/80 hover:bg-card rounded-lg font-medium cursor-pointer"
            >
              <Paperclip className="size-3.5 text-primary" />
              <span className="hidden sm:inline">Attach PDFs</span>
            </Button>

            {/* Export Chat Markdown */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleExportChat}
              className="h-8 text-xs gap-1.5 text-muted-foreground hover:text-foreground rounded-lg cursor-pointer"
              title="Export conversation as Markdown"
            >
              <Download className="size-3.5" />
              <span className="hidden sm:inline">Export</span>
            </Button>
          </div>
        </div>

        {/* API Key Alert Banner if Missing */}
        {!hasApiKey && (
          <div className="bg-amber-500/10 border-b border-amber-500/30 px-4 py-2 flex items-center justify-between text-xs text-amber-600 dark:text-amber-400">
            <div className="flex items-center gap-2">
              <AlertTriangle className="size-4 shrink-0" />
              <span>Google Gemini API Key is required to chat. Please configure your key to begin.</span>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowApiKeyModal(true)}
              className="h-7 text-xs border-amber-500/40 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 rounded-md font-medium"
            >
              Configure Now
            </Button>
          </div>
        )}

        {/* Messages Feed Area */}
        <div className="flex-1 overflow-hidden relative">
          <ScrollArea className="h-full px-4 py-6">
            <div className="max-w-3xl mx-auto space-y-6">
              
              {/* Attached PDFs Pill Summary in Chat */}
              {currentSession?.attachedPdfs && currentSession.attachedPdfs.length > 0 && (
                <div className="p-3 rounded-xl bg-card/60 border border-border/70 text-xs space-y-2">
                  <div className="flex items-center gap-2 font-mono font-medium text-foreground text-[11px]">
                    <FileText className="size-3.5 text-primary" />
                    <span>Active PDF Context ({currentSession.attachedPdfs.length}):</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {currentSession.attachedPdfs.map((pdf, idx) => (
                      <span 
                        key={idx}
                        className="inline-flex items-center gap-1.5 bg-background border border-border/80 px-2.5 py-1 rounded-lg text-[11px] text-muted-foreground font-mono"
                      >
                        <FileText className="size-3 text-primary shrink-0" />
                        <span className="truncate max-w-[200px]">{pdf.filename}</span>
                        <span className="text-[10px] text-primary">({pdf.chunksCount} chunks)</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Message List */}
              {(currentSession?.messages || [])
                .filter((msg) => msg.text && msg.text !== '__GENERATING__')
                .map((msg) => (
                <div 
                  key={msg.id}
                  className={`flex gap-3 text-sm ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {/* Bot Avatar */}
                  {msg.type === 'bot' && (
                    <div className="size-8 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shrink-0 shadow-xs mt-0.5">
                      <Sparkles className="size-4" />
                    </div>
                  )}

                  {/* Message Bubble */}
                  <div 
                    className={`max-w-[85%] sm:max-w-[78%] rounded-2xl p-4 space-y-3 ${
                      msg.type === 'user' 
                        ? 'bg-primary text-primary-foreground font-medium rounded-tr-none' 
                        : 'bg-card border border-border/80 text-card-foreground rounded-tl-none shadow-xs'
                    }`}
                  >
                    <div className="prose dark:prose-invert prose-sm max-w-none text-xs sm:text-sm leading-relaxed">
                      <ReactMarkdown>{msg.text}</ReactMarkdown>
                    </div>

                    {/* Sources Accordion */}
                    {msg.sources && msg.sources.length > 0 && (
                      <div className="pt-2 border-t border-border/50 space-y-2">
                        <button
                          onClick={() => toggleSourceView(msg.id)}
                          className="flex items-center gap-1.5 text-[11px] text-primary hover:underline font-mono cursor-pointer"
                        >
                          <ShieldCheck className="size-3.5" />
                          <span>{msg.sources.length} Grounded Source{msg.sources.length > 1 ? 's' : ''} Cited</span>
                          {expandedSources[msg.id] ? <ChevronUp className="size-3" /> : <ChevronDown className="size-3" />}
                        </button>

                        {expandedSources[msg.id] && (
                          <div className="space-y-1.5 pt-1 animate-in fade-in">
                            {msg.sources.map((src: any, sIdx: number) => {
                              const filename = src.metadata?.filename || src.metadata?.source_url || 'Document'
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
                </div>
              ))}

              {/* Active Dynamic Thinking Bubble */}
              {chatMutation.isPending && (
                <div className="flex gap-3 text-sm justify-start animate-in fade-in duration-200">
                  <div className="size-8 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shrink-0 shadow-xs mt-0.5">
                    <Sparkles className="size-4" />
                  </div>
                  <div className="max-w-[85%] sm:max-w-[78%] rounded-2xl p-4 bg-card border border-border/80 text-card-foreground rounded-tl-none shadow-xs">
                    <div className="flex items-center gap-3 py-1 text-muted-foreground text-xs font-mono">
                      <Loader2 className="size-4 animate-spin text-primary" />
                      <span>Searching Pinecone &amp; generating grounded answer...</span>
                    </div>
                  </div>
                </div>
              )}

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
                placeholder={hasApiKey ? "Ask any grounded question across all attached PDFs..." : "Please configure your API key above to start chatting..."}
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

      {/* ---------------- MULTI-PDF UPLOAD MODAL ---------------- */}
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

      {/* ---------------- SETUP API KEYS MODAL ---------------- */}
      {showApiKeyModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border/80 rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl relative animate-in fade-in zoom-in-95">
            {hasApiKey && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowApiKeyModal(false)}
                className="absolute right-4 top-4 text-muted-foreground hover:text-foreground size-8 rounded-lg cursor-pointer"
              >
                <X className="size-5" />
              </Button>
            )}

            <div className="space-y-1">
              <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-2">
                <KeyRound className="size-5" />
              </div>
              <h3 className="text-lg font-bold font-display text-foreground">
                Configure Your API Keys (BYOK)
              </h3>
              <p className="text-xs text-muted-foreground">
                To start uploading PDFs and querying the RAG engine, enter your personal free API keys. Keys are saved locally in your browser.
              </p>
            </div>

            <form onSubmit={handleSaveApiKeys} className="space-y-4">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-foreground">Google Gemini API Key *</label>
                  <a 
                    href="https://aistudio.google.com/app/apikey" 
                    target="_blank" 
                    rel="noreferrer" 
                    className="text-[11px] text-primary hover:underline flex items-center gap-1"
                  >
                    Get Free Key <ExternalLink className="size-2.5" />
                  </a>
                </div>
                <Input
                  type="password"
                  value={geminiKeyInput}
                  onChange={(e) => setGeminiKeyInput(e.target.value)}
                  placeholder="AIzaSy..."
                  required
                  className="text-xs font-mono bg-background border-border/80"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-foreground">Pinecone API Key (Optional)</label>
                  <a 
                    href="https://app.pinecone.io/" 
                    target="_blank" 
                    rel="noreferrer" 
                    className="text-[11px] text-primary hover:underline flex items-center gap-1"
                  >
                    Get Pinecone Key <ExternalLink className="size-2.5" />
                  </a>
                </div>
                <Input
                  type="password"
                  value={pineconeKeyInput}
                  onChange={(e) => setPineconeKeyInput(e.target.value)}
                  placeholder="pcsk_..."
                  className="text-xs font-mono bg-background border-border/80"
                />
                <p className="text-[10px] text-muted-foreground">
                  If left blank, uses the default shared server Pinecone vector database.
                </p>
              </div>

              <div className="pt-2 flex gap-2">
                <Button
                  type="submit"
                  className="w-full bg-primary text-primary-foreground font-semibold h-10 rounded-xl cursor-pointer"
                >
                  Save &amp; Continue to Chat
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}
