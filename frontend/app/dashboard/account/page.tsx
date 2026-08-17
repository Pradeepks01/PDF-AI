'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { Key, Eye, EyeOff, CheckCircle2, ShieldCheck, RefreshCw, Sparkles, Server, UserCircle, Loader2 } from 'lucide-react'
import { useSession, signOut, signIn } from 'next-auth/react'

export default function AccountSettingsPage() {
  const { data: sessionData, status } = useSession()
  const isPending = status === "loading"

  const [activeTab, setActiveTab] = useState<'session' | 'json'>('session')
  const [pineconeKey, setPineconeKey] = useState('')
  const [geminiKey, setGeminiKey] = useState('')
  const [showPinecone, setShowPinecone] = useState(false)
  const [showGemini, setShowGemini] = useState(false)
  const [isTesting, setIsTesting] = useState(false)
  const [isLoggingIn, setIsLoggingIn] = useState(false)
  const [clientIp, setClientIp] = useState<string>('Detecting...')

  // Load saved keys and client IP on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedPinecone = localStorage.getItem('custom_pinecone_key') || ''
      const savedGemini = localStorage.getItem('custom_gemini_key') || ''
      setPineconeKey(savedPinecone)
      setGeminiKey(savedGemini)

      fetch('/api/ip')
        .then(res => res.json())
        .then(data => {
          if (data?.ip) setClientIp(data.ip)
        })
        .catch(() => setClientIp('127.0.0.1'))
    }
  }, [])

  const handleSave = () => {
    if (typeof window !== 'undefined') {
      if (pineconeKey.trim()) {
        localStorage.setItem('custom_pinecone_key', pineconeKey.trim())
      } else {
        localStorage.removeItem('custom_pinecone_key')
      }

      if (geminiKey.trim()) {
        localStorage.setItem('custom_gemini_key', geminiKey.trim())
      } else {
        localStorage.removeItem('custom_gemini_key')
      }

      toast.success('API Keys saved successfully in local vault!')
    }
  }

  const handleClear = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('custom_pinecone_key')
      localStorage.removeItem('custom_gemini_key')
      setPineconeKey('')
      setGeminiKey('')
      toast.info('API Keys reset to server defaults.')
    }
  }

  const handleTestConnection = async () => {
    setIsTesting(true)
    try {
      const res = await fetch('/api/python-health', { cache: 'no-store' })
      const data = await res.json()
      if (res.ok && (data.status === 'online' || data.service)) {
        toast.success(`Connection Active! Services: ${data.vector_db || 'Pinecone'} + ${data.llm || 'Google Gemini'}`)
      } else {
        toast.error(data.error || 'Failed to reach Python backend service')
      }
    } catch (err: any) {
      toast.error('Failed to reach Python backend service')
    } finally {
      setIsTesting(false)
    }
  }

  const handleLogout = () => {
    signOut({ callbackUrl: '/sign-in' })
  }

  const handleGoogleLogin = () => {
    setIsLoggingIn(true)
    signIn('google', { callbackUrl: '/dashboard/account' })
  }

  const user = sessionData?.user
  const session = sessionData?.session

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto w-full space-y-8 pb-20">
      {/* ---------------- PROFILE CARD ---------------- */}
      <div className="surface-panel rounded-2xl p-6 space-y-6 shadow-2xl border border-border/80">
        <h2 className="text-xl font-bold font-display text-foreground">User Profile &amp; Session</h2>

        {isPending ? (
          <div className="flex items-center justify-center py-10 gap-3 text-muted-foreground">
            <Loader2 className="size-5 animate-spin text-primary" />
            <span className="text-sm font-medium">Loading session data...</span>
          </div>
        ) : user ? (
          <>
            <div className="flex items-center gap-4">
              {user.image ? (
                <img 
                  src={user.image} 
                  alt={user.name || 'User Avatar'} 
                  className="size-16 rounded-full border-2 border-primary/40 object-cover"
                />
              ) : (
                <div className="size-16 rounded-full bg-card border-2 border-border/80 flex items-center justify-center text-muted-foreground">
                  <UserCircle className="size-10 text-primary" />
                </div>
              )}

              <div>
                <h3 className="text-xl font-bold font-display text-foreground">{user.name || 'Research User'}</h3>
                <p className="text-sm text-muted-foreground font-mono">{user.email}</p>
              </div>
            </div>

            {/* Tab Switcher */}
            <div className="flex items-center gap-1 bg-background/80 border border-border/80 p-1 rounded-xl w-fit">
              <button
                onClick={() => setActiveTab('session')}
                className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  activeTab === 'session' 
                    ? 'bg-primary text-primary-foreground shadow-xs' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Session Data
              </button>
              <button
                onClick={() => setActiveTab('json')}
                className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  activeTab === 'json' 
                    ? 'bg-primary text-primary-foreground shadow-xs' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Raw JSON
              </button>
            </div>

            {/* Tab Content */}
            {activeTab === 'session' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 text-sm">
                <div>
                  <p className="text-xs font-semibold text-muted-foreground mb-1">Expires At</p>
                  <p className="font-medium text-foreground">
                    {session?.expiresAt ? new Date(session.expiresAt).toLocaleString() : 'Active Session'}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-semibold text-muted-foreground mb-1">User Agent</p>
                  <p className="font-mono text-xs text-muted-foreground break-words leading-relaxed">
                    {session?.userAgent || (typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown')}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-semibold text-muted-foreground mb-1">Client IP Address</p>
                  <p className="font-mono font-semibold text-primary text-base">
                    {clientIp}
                  </p>
                </div>
              </div>
            ) : (
              <div className="pt-2">
                <pre className="bg-background/90 p-4 rounded-xl text-xs font-mono text-primary overflow-x-auto border border-border/80">
                  {JSON.stringify({ ...sessionData, ipAddress: clientIp }, null, 2)}
                </pre>
              </div>
            )}

            {/* Logout Button */}
            <div className="pt-2">
              <Button
                onClick={handleLogout}
                className="bg-card hover:bg-card/80 text-foreground border border-border/80 font-medium px-6 py-2 rounded-xl text-sm transition cursor-pointer"
              >
                Logout
              </Button>
            </div>
          </>
        ) : (
          <div className="py-6 space-y-4 text-center">
            <p className="text-sm text-muted-foreground">You are currently using guest session storage.</p>
            <Button
              onClick={handleGoogleLogin}
              disabled={isLoggingIn}
              className="bg-primary text-primary-foreground hover:opacity-90 font-semibold gap-2 px-6 py-2 rounded-xl text-sm transition glow-ring cursor-pointer"
            >
              {isLoggingIn ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <svg className="size-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
              )}
              <span>Sign In with Google</span>
            </Button>
          </div>
        )}
      </div>

      {/* ---------------- API KEY CONFIGURATION SECTION ---------------- */}
      <div className="space-y-6 pt-2">
        <div className="border-b border-border/60 pb-4 flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center text-primary glow-ring">
              <Key className="size-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold font-display text-foreground">API Key Vault (BYOK)</h1>
              <p className="text-xs text-muted-foreground">Configure your personal Pinecone &amp; Google Gemini API Keys for RAG processing.</p>
            </div>
          </div>

          <Button 
            variant="outline"
            size="sm" 
            onClick={handleTestConnection}
            disabled={isTesting}
            className="gap-1.5 rounded-xl border-border/80 hover:bg-card cursor-pointer"
          >
            <RefreshCw className={`size-3.5 ${isTesting ? 'animate-spin' : 'text-primary'}`} />
            <span>Test API Backend</span>
          </Button>
        </div>

        {/* Pinecone API Key Card */}
        <Card className="surface-panel border-border/80 rounded-2xl shadow-xl">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <Sparkles className="size-5 text-primary" />
                <CardTitle className="text-base font-display">Pinecone Vector DB API Key</CardTitle>
              </div>
              {pineconeKey ? (
                <span className="text-xs bg-primary/15 text-primary border border-primary/30 px-2.5 py-0.5 rounded-full font-medium flex items-center gap-1">
                  <CheckCircle2 className="size-3.5 text-primary" /> Custom Key Active
                </span>
              ) : (
                <span className="text-xs bg-card text-muted-foreground border border-border/80 px-2.5 py-0.5 rounded-full font-medium flex items-center gap-1">
                  <Server className="size-3.5" /> Using Server Default Key
                </span>
              )}
            </div>
            <CardDescription className="text-xs text-muted-foreground">
              Enter your Pinecone API Key to store and search vector embeddings in your personal serverless index (e.g. pcsk_...).
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="relative">
              <Input 
                type={showPinecone ? "text" : "password"}
                value={pineconeKey}
                onChange={(e) => setPineconeKey(e.target.value)}
                placeholder="pcsk_7XgyCo_RS7kVEP4yuWU72TxDv6NC..."
                className="pr-10 font-mono text-xs rounded-xl border-border/80 bg-background/60"
              />
              <button
                type="button"
                onClick={() => setShowPinecone(!showPinecone)}
                className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground cursor-pointer"
              >
                {showPinecone ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Google Gemini API Key Card */}
        <Card className="surface-panel border-border/80 rounded-2xl shadow-xl">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <ShieldCheck className="size-5 text-primary" />
                <CardTitle className="text-base font-display">Google Gemini API Key</CardTitle>
              </div>
              {geminiKey ? (
                <span className="text-xs bg-primary/15 text-primary border border-primary/30 px-2.5 py-0.5 rounded-full font-medium flex items-center gap-1">
                  <CheckCircle2 className="size-3.5 text-primary" /> Custom Key Active
                </span>
              ) : (
                <span className="text-xs bg-card text-muted-foreground border border-border/80 px-2.5 py-0.5 rounded-full font-medium flex items-center gap-1">
                  <Server className="size-3.5" /> Using Server Default Key
                </span>
              )}
            </div>
            <CardDescription className="text-xs text-muted-foreground">
              Enter your Google Gemini API Key from Google AI Studio to power 768-dim embeddings and RAG answers.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="relative">
              <Input 
                type={showGemini ? "text" : "password"}
                value={geminiKey}
                onChange={(e) => setGeminiKey(e.target.value)}
                placeholder="AQ.Ab8RN6Kk1l_7JVj_vxXNSTaW6fs..."
                className="pr-10 font-mono text-xs rounded-xl border-border/80 bg-background/60"
              />
              <button
                type="button"
                onClick={() => setShowGemini(!showGemini)}
                className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground cursor-pointer"
              >
                {showGemini ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-2">
          <Button
            variant="ghost"
            onClick={handleClear}
            className="text-destructive hover:text-destructive hover:bg-destructive/10 text-xs rounded-xl cursor-pointer"
          >
            Reset to Default Keys
          </Button>

          <Button 
            onClick={handleSave}
            className="bg-primary text-primary-foreground hover:opacity-90 font-display font-semibold px-6 rounded-xl glow-ring cursor-pointer"
          >
            Save API Keys
          </Button>
        </div>
      </div>
    </div>
  )
}