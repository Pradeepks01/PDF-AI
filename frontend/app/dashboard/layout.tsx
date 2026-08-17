"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useMediaQuery } from "react-responsive";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  Menu,
  Globe,
  Link2,
  KeyRound,
  User,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  MessagesSquare,
} from "lucide-react";
import NavbarProfile from "@/components/NavbarProfile";
import { ModeToggle } from "@/components/ModeToggle";
import { useSession, signOut } from "next-auth/react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const isLargeScreen = useMediaQuery({ query: "(min-width: 1024px)" });
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    setMounted(true);
    setIsSidebarOpen(isLargeScreen);
  }, [isLargeScreen]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace(`/sign-in?callbackUrl=${encodeURIComponent(pathname || "/dashboard")}`);
    }
  }, [status, router, pathname]);

  if (status === "loading" || status === "unauthenticated") {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="size-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center animate-pulse shadow-lg shadow-primary/20">
            <Sparkles className="size-5" />
          </div>
          <p className="text-xs text-muted-foreground animate-pulse font-mono">Authenticating session...</p>
        </div>
      </div>
    );
  }

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
                <Icon className={`size-4 ${active ? "text-primary" : "text-muted-foreground"}`} />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* User Footer Actions */}
      <div className="pt-3 border-t border-border/60 space-y-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => signOut({ callbackUrl: "/" })}
          className="w-full justify-start gap-2.5 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive border-border/80 rounded-xl font-medium"
        >
          <LogOut className="size-3.5" />
          Sign Out
        </Button>
      </div>
    </nav>
  );

  return (
    <div className="flex h-screen w-full bg-background text-foreground overflow-hidden">
      {/* Desktop Collapsible Sidebar */}
      {isLargeScreen && (
        <aside
          className={`h-full border-r border-border/80 bg-sidebar transition-all duration-300 ease-in-out relative flex flex-col shrink-0 ${
            isSidebarOpen ? "w-64" : "w-0 overflow-hidden border-r-0"
          }`}
        >
          {isSidebarOpen && <SidebarContent />}
        </aside>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">
        {/* Top Navbar */}
        <header className="h-14 border-b border-border/80 bg-card/80 backdrop-blur-md flex items-center justify-between px-4 shrink-0 z-10">
          <div className="flex items-center gap-2">
            {/* Mobile Sheet Trigger */}
            {!isLargeScreen && (
              <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="size-8 rounded-lg">
                    <Menu className="size-4" />
                    <span className="sr-only">Toggle Sidebar</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="p-0 w-64 bg-sidebar">
                  <SidebarContent />
                </SheetContent>
              </Sheet>
            )}

            {/* Desktop Sidebar Toggle */}
            {isLargeScreen && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="size-8 rounded-lg text-muted-foreground hover:text-foreground"
                title={isSidebarOpen ? "Collapse Sidebar" : "Expand Sidebar"}
              >
                {isSidebarOpen ? <ChevronLeft className="size-4" /> : <ChevronRight className="size-4" />}
                <span className="sr-only">Toggle Sidebar</span>
              </Button>
            )}

            <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-muted-foreground">
              <span className="text-foreground font-semibold font-display">PDF AI RAG Studio</span>
              <span>/</span>
              <span className="capitalize">{pathname.replace("/dashboard", "").replace("/", "") || "Workspace"}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <ModeToggle />
            <NavbarProfile />
          </div>
        </header>

        {/* Page View */}
        <main className="flex-1 overflow-y-auto relative h-full">
          {children}
        </main>
      </div>
    </div>
  );
}