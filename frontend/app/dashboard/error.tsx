'use client'

import React, { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { RotateCcw, AlertTriangle } from 'lucide-react'

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Dashboard Error Caught:', error)
  }, [error])

  return (
    <div className="flex-1 h-full min-h-[400px] flex items-center justify-center p-6">
      <div className="max-w-md w-full surface-panel rounded-3xl p-8 text-center space-y-6 shadow-2xl border border-border/80">
        <div className="size-14 rounded-2xl bg-primary/15 text-primary flex items-center justify-center mx-auto glow-ring">
          <AlertTriangle className="size-7" />
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-bold font-display text-foreground">Workspace State Recovered</h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Click below to refresh the active RAG workspace and re-sync your chat sessions.
          </p>
        </div>

        <Button
          onClick={() => reset()}
          className="bg-primary text-primary-foreground font-semibold text-xs rounded-xl h-10 px-6 gap-2 glow-ring cursor-pointer"
        >
          <RotateCcw className="size-3.5" />
          <span>Reload Active Workspace</span>
        </Button>
      </div>
    </div>
  )
}
