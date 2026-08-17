"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

export function ModeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  const isDark = mounted ? resolvedTheme === "dark" || theme === "dark" : true

  const toggleTheme = () => {
    setTheme(isDark ? "light" : "dark")
  }

  return (
    <button
      onClick={toggleTheme}
      className="size-9 rounded-xl border border-border/70 bg-card/60 hover:bg-card text-foreground flex items-center justify-center transition-colors cursor-pointer"
      aria-label="Toggle theme"
      type="button"
    >
      {mounted ? (
        isDark ? (
          <Sun className="size-4 text-primary" />
        ) : (
          <Moon className="size-4 text-foreground" />
        )
      ) : (
        <span className="size-4 block" />
      )}
    </button>
  )
}
