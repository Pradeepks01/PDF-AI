"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMediaQuery } from "react-responsive";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  Menu,
  FileText,
  Globe,
  Link2,
  KeyRound,
  User,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  MessagesSquare,
  Compass,
} from "lucide-react";
import NavbarProfile from "@/components/NavbarProfile";
import { ModeToggle } from "@/components/ModeToggle";
import { signOut } from "next-auth/react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const isLargeScreen = useMediaQuery({ query: "(min-width: 1024px)" });
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
    setIsSidebarOpen(isLargeScreen);
  }, [isLargeScreen]);

  const navItems = [
    { href: "/dashboard", label: "RAG Workspace", icon: MessagesSquare },
    { href: "/dashboard/web-loader", label: "Web Crawler", icon: Globe },
    { href: "/dashboard/web-links", label: "Indexed URLs", icon: Link2 },
    { href: "/dashboard/account", label: "API Key Vault", icon: KeyRound },
    { href: "/dashboard/account", label: "Account Profile", icon: User },
  ];

  const isItemActive = (href: string, label: string) => {
    if (label === "RAG Workspace") {
      return pathname === "/dashboard" || pathname.startsWith("/dashboard/chat");
    }
    if (label === "API Key Vault") {
      return pathname === "/dashboard/account";
    }
    if (label === "Account Profile") {
      return pathname === "/dashboard/account";
    }
    return pathname.startsWith(href);
  };

  const handleLinkClick = () => {
    if (mounted && !isLargeScreen) {
      setIsSidebarOpen(false);
    }
  };

  const SidebarContent = () => (
    <nav className="flex flex-col h-full justify-between p-3.5">
      <div className="space-y-2">
        {/* Brand Logo */}
        <Link
          href="/"
          onClick={handleLinkClick}
          className="flex items-center gap-2.5 px-3 py-2.5 mb-3 rounded-xl bg-card border border-border/80 hover:border-primary/40 transition-colors group"
        >
          <div className="size-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center glow-ring group-hover:scale-105 transition-transform">
            <Sparkles className="size-4" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-display font-semibold text-sm tracking-tight text-foreground truncate">
              PDF AI Studio
            </span>
            <span className="font-mono text-[10px] text-muted-foreground truncate">
              Pinecone &amp; Gemini 2.5
            </span>
          </div>
        </Link>

        {/* Navigation Items */}
        <div className="space-y-1">
          {navItems.map((item, idx) => {
            const Icon = item.icon;
            const active = isItemActive(item.href, item.label);
            return (
              <Link
                key={idx}
                href={item.href}
                onClick={handleLinkClick}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  active
                    ? "bg-primary/15 text-primary font-semibold border border-primary/30 shadow-xs"
                    : "text-muted-foreground hover:bg-card hover:text-foreground border border-transparent"
                }`}
              >
                <Icon className={`size-4 shrink-0 ${active ? "text-primary" : ""}`} />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="pt-3 border-t border-border/60 space-y-2">
        <div className="px-3 py-2 rounded-xl bg-card/60 border border-border/60 text-[11px] text-muted-foreground flex items-center justify-between">
          <span className="flex items-center gap-1.5 font-medium">
            <Sparkles className="size-3.5 text-primary" />
            <span>SOTA 6-Stage RAG</span>
          </span>
          <span className="text-[9px] bg-primary/15 text-primary px-1.5 py-0.5 rounded font-mono font-semibold">
            Active
          </span>
        </div>

        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start text-xs text-destructive hover:text-destructive hover:bg-destructive/10 gap-2 h-9 rounded-xl cursor-pointer"
          onClick={() => signOut({ callbackUrl: "/sign-in" })}
        >
          <LogOut className="size-4" />
          <span>Logout</span>
        </Button>
      </div>
    </nav>
  );

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground selection:bg-primary/25 selection:text-foreground">
      {/* ---------------- TOP HEADER ---------------- */}
      <header className="sticky top-0 z-40 h-14 border-b border-border/60 bg-background/80 backdrop-blur-xl px-4 flex items-center justify-between">
        {/* Left: Sidebar Toggle + Title */}
        <div className="flex items-center gap-3">
          {mounted && isLargeScreen ? (
            <Button
              variant="ghost"
              size="icon"
              className="size-8 text-muted-foreground hover:text-foreground cursor-pointer rounded-lg"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              title={isSidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
            >
              {isSidebarOpen ? <ChevronLeft className="size-4" /> : <ChevronRight className="size-4" />}
            </Button>
          ) : (
            mounted && (
              <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="size-8 text-muted-foreground cursor-pointer rounded-lg">
                    <Menu className="size-4" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-64 p-0 bg-background border-r border-border">
                  <SidebarContent />
                </SheetContent>
              </Sheet>
            )
          )}

          <Link href="/" className="flex items-center gap-2 group">
            <div className="size-6 rounded-md bg-primary text-primary-foreground flex items-center justify-center glow-ring">
              <Sparkles className="size-3.5" />
            </div>
            <span className="font-display font-semibold text-sm tracking-tight text-foreground">
              PDF AI RAG Studio
            </span>
          </Link>
        </div>

        {/* Right: Theme Toggle & Profile Avatar */}
        <div className="flex items-center gap-2.5">
          <ModeToggle />
          <NavbarProfile />
        </div>
      </header>

      {/* ---------------- BODY: SIDEBAR + MAIN CONTENT ---------------- */}
      <div className="flex flex-1 h-[calc(100vh-56px)] overflow-hidden">
        {/* Desktop Left Sidebar */}
        {mounted && isLargeScreen && (
          <aside
            className={`transition-all duration-300 ease-in-out border-r border-border/60 bg-background/50 backdrop-blur-sm shrink-0 ${
              isSidebarOpen ? "w-60" : "w-0 overflow-hidden border-r-0"
            }`}
          >
            <div className="h-full overflow-y-auto">
              <SidebarContent />
            </div>
          </aside>
        )}

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col h-full overflow-hidden min-w-0 bg-background/30">
          {children}
        </main>
      </div>
    </div>
  );
}