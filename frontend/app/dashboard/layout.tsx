"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
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
  Activity,
} from "lucide-react";
import NavbarProfile from "@/components/NavbarProfile";
import { ModeToggle } from "@/components/ModeToggle";
import { useSession, signOut } from "next-auth/react";
import { LogoIcon } from "@/components/LogoIcon";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isLargeScreen, setIsLargeScreen] = useState(true);
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    setMounted(true);
    const checkScreen = () => {
      const large = window.innerWidth >= 1024;
      setIsLargeScreen(large);
    };
    checkScreen();
    window.addEventListener("resize", checkScreen);
    return () => window.removeEventListener("resize", checkScreen);
  }, []);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace(`/sign-in?callbackUrl=${encodeURIComponent(pathname || "/dashboard")}`);
    }
  }, [status, router, pathname]);

  if (status === "loading" || status === "unauthenticated") {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <LogoIcon className="size-10 text-primary animate-pulse" />
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
    if (label === "API Key Vault" || label === "Account Profile") {
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
    <nav className="flex flex-col h-full justify-between p-4 bg-sidebar">
      <div className="space-y-4">
        {/* Brand Logo */}
        {/* Brand Logo */}
        <Link
          href="/"
          onClick={handleLinkClick}
          className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl bg-card/60 border border-border/80 hover:border-primary/40 transition-all group"
        >
          <LogoIcon className="size-6 text-primary group-hover:scale-105 transition-transform" />
          <span className="font-display font-bold text-sm tracking-tight text-foreground truncate">
            PDF AI
          </span>
        </Link>

        {/* Navigation Section */}
        <div className="space-y-1">
          <p className="px-3 text-[10px] font-mono font-semibold uppercase tracking-wider text-muted-foreground/80 mb-2">
            Navigation
          </p>
          {navItems.map((item, idx) => {
            const Icon = item.icon;
            const active = isItemActive(item.href, item.label);
            return (
              <Link
                key={idx}
                href={item.href}
                onClick={handleLinkClick}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  active
                    ? "bg-primary text-primary-foreground font-semibold shadow-sm"
                    : "text-muted-foreground hover:bg-card/70 hover:text-foreground border border-transparent"
                }`}
              >
                <Icon className={`size-4 ${active ? "text-primary-foreground" : "text-muted-foreground"}`} />
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
          className="w-full justify-start gap-2.5 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive border-border/80 rounded-xl font-medium cursor-pointer"
        >
          <LogOut className="size-3.5" />
          <span>Sign Out</span>
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
        <header className="h-14 border-b border-border/80 bg-card/70 backdrop-blur-md flex items-center justify-between px-4 sm:px-6 shrink-0 z-10">
          <div className="flex items-center gap-2.5">
            {/* Mobile Sheet Trigger */}
            {!isLargeScreen && (
              <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="size-8 rounded-lg cursor-pointer">
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
                className="size-8 rounded-lg text-muted-foreground hover:text-foreground cursor-pointer"
                title={isSidebarOpen ? "Collapse Sidebar" : "Expand Sidebar"}
              >
                {isSidebarOpen ? <ChevronLeft className="size-4" /> : <ChevronRight className="size-4" />}
                <span className="sr-only">Toggle Sidebar</span>
              </Button>
            )}

            <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground">
              <span className="text-foreground font-semibold font-display">PDF AI</span>
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