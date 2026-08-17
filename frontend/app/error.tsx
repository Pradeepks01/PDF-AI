'use client'

import React, { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { RotateCcw, AlertTriangle, Home } from 'lucide-react'
import Link from 'next/link'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Next.js Client Exception Caught:', error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="max-w-md w-full surface-panel rounded-3xl p-8 text-center space-y-6 shadow-2xl border border-border/80">
        <div className="size-14 rounded-2xl bg-primary/15 text-primary flex items-center justify-center mx-auto glow-ring">
          <AlertTriangle className="size-7" />
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-bold font-display text-foreground">Session Recovered</h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            The workspace encountered a temporary rendering state. Click below to reload your clean session.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <Button
            onClick={() => {
              if (typeof window !== 'undefined') {
                window.location.reload()
              } else {
                reset()
              }
            }}
            className="bg-primary text-primary-foreground font-semibold text-xs rounded-xl h-10 px-5 gap-2 glow-ring cursor-pointer"
          >
            <RotateCcw className="size-3.5" />
            <span>Reload Clean Workspace</span>
          </Button>

          <Link href="/">
            <Button
              variant="outline"
              className="text-xs rounded-xl h-10 px-4 gap-2 w-full sm:w-auto"
            >
              <Home className="size-3.5" />
              <span>Go Home</span>
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
