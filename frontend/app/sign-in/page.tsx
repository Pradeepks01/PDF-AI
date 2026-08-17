"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useTheme } from "next-themes";
import {
  Sparkles,
  Loader2,
  Mail,
  Lock,
  User,
  Sun,
  Moon,
  ArrowRight,
  ShieldCheck,
  ChevronLeft,
} from "lucide-react";
import { toast } from "sonner";

export default function SignInPage() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted ? resolvedTheme === "dark" || theme === "dark" : true;

  const toggleTheme = () => {
    setTheme(isDark ? "light" : "dark");
  };

  // Form states
  const [signInEmail, setSignInEmail] = useState("");
  const [signInPassword, setSignInPassword] = useState("");
  const [signUpName, setSignUpName] = useState("");
  const [signUpEmail, setSignUpEmail] = useState("");
  const [signUpPassword, setSignUpPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<string | null>(null);

  // Handle Google Login
  const handleGoogleLogin = () => {
    setSocialLoading("google");
    const searchParams = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
    const targetCallback = searchParams?.get("callbackUrl") || "/dashboard";
    signIn("google", { callbackUrl: targetCallback });
  };

  // Handle Email Sign In
  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signInEmail || !signInPassword) {
      toast.error("Please enter your email and password");
      return;
    }

    setLoading(true);
    try {
      const searchParams = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
      const targetCallback = searchParams?.get("callbackUrl") || "/dashboard";

      const res = await signIn("credentials", {
        redirect: false,
        email: signInEmail,
        password: signInPassword,
        isRegistering: "false",
        callbackUrl: targetCallback,
      });

      setLoading(false);
      if (res?.error) {
        toast.error(res.error || "Invalid email or password");
      } else {
        toast.success("Signed in successfully!");
        window.location.href = targetCallback;
      }
    } catch (err: any) {
      setLoading(false);
      console.error(err);
      toast.error("Sign in failed. Check your credentials.");
    }
  };

  // Handle Email Sign Up
  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signUpName || !signUpEmail || !signUpPassword) {
      toast.error("Please fill in all registration fields");
      return;
    }

    if (signUpPassword.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }

    setLoading(true);
    try {
      const searchParams = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
      const targetCallback = searchParams?.get("callbackUrl") || "/dashboard";

      const res = await signIn("credentials", {
        redirect: false,
        name: signUpName,
        email: signUpEmail,
        password: signUpPassword,
        isRegistering: "true",
        callbackUrl: targetCallback,
      });

      setLoading(false);
      if (res?.error) {
        toast.error(res.error || "Registration failed");
      } else {
        toast.success("Account created and signed in!");
        window.location.href = targetCallback;
      }
    } catch (err: any) {
      setLoading(false);
      console.error(err);
      toast.error("Registration failed. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground relative flex flex-col justify-between overflow-x-hidden selection:bg-primary/25 selection:text-foreground animate-in fade-in duration-300">
      {/* ---------------- 1. AMBIENT BACKGROUND GLOWS ---------------- */}
      <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden" aria-hidden="true">
        <div className="absolute inset-0 grid-backdrop opacity-40" />

        <div
          className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[36rem] h-[36rem] rounded-full blur-[130px] opacity-20 pointer-events-none"
          style={{ background: "var(--primary)" }}
        />

        <div
          className="absolute bottom-[10%] right-[-5%] w-[26rem] h-[26rem] rounded-full blur-[100px] opacity-20 pointer-events-none"
          style={{ background: "var(--accent)" }}
        />
      </div>

      {/* ---------------- 2. TOP NAV HEADER ---------------- */}
      <header className="h-16 border-b border-border/60 bg-background/70 backdrop-blur-xl px-4 sm:px-8 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="size-8 rounded-xl bg-primary text-primary-foreground flex items-center justify-center glow-ring group-hover:scale-105 transition-transform">
            <Sparkles className="size-4" />
          </div>
          <span className="font-display font-semibold text-base sm:text-lg tracking-tight text-foreground">
            PDF AI RAG Studio
          </span>
        </Link>

        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="hidden sm:inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronLeft className="size-3.5" />
            <span>Back to home</span>
          </Link>

          <button
            onClick={toggleTheme}
            className="size-9 rounded-xl border border-border/70 bg-card/60 hover:bg-card text-foreground flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Toggle theme"
            type="button"
          >
            {mounted ? (
              isDark ? (
                <Sun className="size-4.5 text-primary" />
              ) : (
                <Moon className="size-4.5 text-foreground" />
              )
            ) : (
              <Sun className="size-4.5 text-primary" />
            )}
          </button>
        </div>
      </header>

      {/* ---------------- 3. MAIN SIGN-IN CONTAINER ---------------- */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 my-8">
        <div className="w-full max-w-md surface-panel rounded-3xl p-6 sm:p-8 shadow-2xl border border-border/80 relative animate-in fade-in zoom-in-95 duration-400">
          {/* Card Header */}
          <div className="text-center space-y-2 mb-6">
            <div className="mx-auto size-12 rounded-2xl bg-primary/15 text-primary flex items-center justify-center glow-ring mb-3">
              <Sparkles className="size-6" />
            </div>
            <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">
              Welcome to RAG Studio
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Sign in to access your multi-PDF vector collections and web crawler
            </p>
          </div>

          <div className="space-y-5">
            {/* Google OAuth Login Button */}
            <Button
              type="button"
              variant="outline"
              className="w-full gap-3 py-6 font-display font-semibold text-sm border-border hover:bg-card/80 transition-all rounded-xl shadow-xs cursor-pointer"
              disabled={socialLoading !== null || loading}
              onClick={handleGoogleLogin}
            >
              {socialLoading === "google" ? (
                <Loader2 className="size-5 animate-spin text-primary" />
              ) : (
                <svg className="size-5" viewBox="0 0 24 24">
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
              <span>Continue with Google</span>
            </Button>

            {/* Divider */}
            <div className="relative flex items-center justify-center my-4">
              <div className="border-t border-border/70 w-full" />
              <span className="bg-card px-2.5 text-[10px] text-muted-foreground uppercase font-mono tracking-wider font-semibold shrink-0">
                Or with Email
              </span>
            </div>

            {/* Email Tabs */}
            <Tabs defaultValue="signin" className="w-full space-y-4">
              <TabsList className="grid w-full grid-cols-2 rounded-xl bg-background/80 border border-border/80 p-1">
                <TabsTrigger
                  value="signin"
                  className="rounded-lg text-xs font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all cursor-pointer"
                >
                  Sign In
                </TabsTrigger>
                <TabsTrigger
                  value="signup"
                  className="rounded-lg text-xs font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all cursor-pointer"
                >
                  Register
                </TabsTrigger>
              </TabsList>

              {/* Sign In Tab */}
              <TabsContent value="signin" className="space-y-3.5 pt-1">
                <form onSubmit={handleEmailSignIn} className="space-y-3.5">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-foreground">Email Address</Label>
                    <div className="relative">
                      <Mail className="size-4 absolute left-3 top-3 text-muted-foreground" />
                      <Input
                        type="email"
                        placeholder="researcher@example.com"
                        value={signInEmail}
                        onChange={(e) => setSignInEmail(e.target.value)}
                        className="pl-9 text-xs rounded-xl border-border/80 bg-background/60 focus-visible:ring-primary"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-foreground">Password</Label>
                    <div className="relative">
                      <Lock className="size-4 absolute left-3 top-3 text-muted-foreground" />
                      <Input
                        type="password"
                        placeholder="••••••••"
                        value={signInPassword}
                        onChange={(e) => setSignInPassword(e.target.value)}
                        className="pl-9 text-xs rounded-xl border-border/80 bg-background/60 focus-visible:ring-primary"
                        required
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-primary text-primary-foreground hover:opacity-90 font-display font-semibold py-5 rounded-xl glow-ring cursor-pointer transition-all mt-2"
                  >
                    {loading ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <div className="flex items-center gap-2">
                        <span>Sign In to Workspace</span>
                        <ArrowRight className="size-4" />
                      </div>
                    )}
                  </Button>
                </form>
              </TabsContent>

              {/* Register Tab */}
              <TabsContent value="signup" className="space-y-3.5 pt-1">
                <form onSubmit={handleEmailSignUp} className="space-y-3.5">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-foreground">Full Name</Label>
                    <div className="relative">
                      <User className="size-4 absolute left-3 top-3 text-muted-foreground" />
                      <Input
                        type="text"
                        placeholder="Alex Morgan"
                        value={signUpName}
                        onChange={(e) => setSignUpName(e.target.value)}
                        className="pl-9 text-xs rounded-xl border-border/80 bg-background/60 focus-visible:ring-primary"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-foreground">Email Address</Label>
                    <div className="relative">
                      <Mail className="size-4 absolute left-3 top-3 text-muted-foreground" />
                      <Input
                        type="email"
                        placeholder="alex@company.com"
                        value={signUpEmail}
                        onChange={(e) => setSignUpEmail(e.target.value)}
                        className="pl-9 text-xs rounded-xl border-border/80 bg-background/60 focus-visible:ring-primary"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-foreground">Password</Label>
                    <div className="relative">
                      <Lock className="size-4 absolute left-3 top-3 text-muted-foreground" />
                      <Input
                        type="password"
                        placeholder="At least 6 characters"
                        value={signUpPassword}
                        onChange={(e) => setSignUpPassword(e.target.value)}
                        className="pl-9 text-xs rounded-xl border-border/80 bg-background/60 focus-visible:ring-primary"
                        required
                        minLength={6}
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-primary text-primary-foreground hover:opacity-90 font-display font-semibold py-5 rounded-xl glow-ring cursor-pointer transition-all mt-2"
                  >
                    {loading ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <div className="flex items-center gap-2">
                        <span>Create Account</span>
                        <ArrowRight className="size-4" />
                      </div>
                    )}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </div>

          {/* Security Footer */}
          <div className="pt-6 mt-6 border-t border-border/60 flex items-center justify-center gap-2 text-[11px] text-muted-foreground font-medium">
            <ShieldCheck className="size-3.5 text-primary" />
            <span>Google OAuth 2.0 &amp; Encrypted Session Auth</span>
          </div>
        </div>
      </main>

      {/* ---------------- 4. BOTTOM FOOTER ---------------- */}
      <footer className="py-6 border-t border-border/60 bg-background/60 text-center text-xs text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} PDF AI RAG Studio. All rights reserved.</p>
      </footer>
    </div>
  );
}