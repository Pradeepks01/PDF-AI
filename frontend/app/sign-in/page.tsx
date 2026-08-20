"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useTheme } from "next-themes";
import {
  Loader2,
  Eye,
  EyeOff,
  Sun,
  Moon,
  ChevronLeft,
} from "lucide-react";
import { LogoIcon } from "@/components/LogoIcon";
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

  // Auth mode: 'signin' or 'signup'
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [showPassword, setShowPassword] = useState(false);

  // Form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");

  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<string | null>(null);

  // Handle Google Login
  const handleGoogleLogin = () => {
    setSocialLoading("google");
    const searchParams = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
    const targetCallback = searchParams?.get("callbackUrl") || "/dashboard";
    signIn("google", { callbackUrl: targetCallback });
  };

  // Handle GitHub Login
  const handleGithubLogin = () => {
    setSocialLoading("github");
    const searchParams = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
    const targetCallback = searchParams?.get("callbackUrl") || "/dashboard";
    signIn("github", { callbackUrl: targetCallback });
  };

  // Handle Submit (Sign In or Sign Up)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please enter your email and password");
      return;
    }

    if (mode === "signup" && !fullName) {
      toast.error("Please enter your full name");
      return;
    }

    if (mode === "signup" && password.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }

    setLoading(true);
    try {
      const searchParams = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
      const targetCallback = searchParams?.get("callbackUrl") || "/dashboard";

      if (mode === "signin") {
        const res = await signIn("credentials", {
          redirect: false,
          email,
          password,
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
      } else {
        const res = await signIn("credentials", {
          redirect: false,
          name: fullName,
          email,
          password,
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
      }
    } catch (err: any) {
      setLoading(false);
      console.error(err);
      toast.error("Authentication failed. Please check your details.");
    }
  };

  const handleForgotPassword = () => {
    toast.info("Password reset link will be sent to your email address.");
  };

  return (
    <div className="min-h-screen text-foreground relative flex flex-col justify-between overflow-x-hidden selection:bg-primary/25 selection:text-foreground">
      
      {/* ---------------- 1. FULL PAGE BOX-GRID & BLUE BACKGROUND ---------------- */}
      <div className="landing-bg" aria-hidden="true" />
      <div className="landing-grid-full" aria-hidden="true" />

      <div className="relative z-10 flex flex-col justify-between min-h-screen">
        
        {/* ---------------- 2. TOP NAV HEADER ---------------- */}
        <header className="h-16 px-4 sm:px-8 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="size-8 rounded-xl bg-cyan-400 text-slate-950 flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
              <LogoIcon className="size-4.5" />
            </div>
            <span className="font-display font-bold text-base sm:text-lg tracking-tight text-white">
              PDF AI RAG Studio
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-100/90 hover:text-white transition-colors"
            >
              <ChevronLeft className="size-3.5" />
              <span>Back to home</span>
            </Link>

            <button
              onClick={toggleTheme}
              className="size-8 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer backdrop-blur-md"
              aria-label="Toggle theme"
              type="button"
            >
              {mounted ? (
                isDark ? (
                  <Sun className="size-3.5 text-cyan-300" />
                ) : (
                  <Moon className="size-3.5 text-white" />
                )
              ) : (
                <Sun className="size-3.5 text-cyan-300" />
              )}
            </button>
          </div>
        </header>

        {/* ---------------- 3. MAIN SIGN-IN CONTAINER (WHITE CARD) ---------------- */}
        <main className="flex-1 flex items-center justify-center p-4 sm:p-6 my-4">
          <div className="w-full max-w-[440px] bg-white rounded-[28px] sm:rounded-[32px] p-7 sm:p-10 shadow-2xl border border-slate-100 relative text-slate-900">
            
            {/* Header */}
            <div className="text-center space-y-1.5 mb-7">
              <h1 className="font-display text-2xl sm:text-[26px] font-bold tracking-tight text-slate-900">
                {mode === "signin" ? "Welcome Back" : "Create Account"}
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 font-normal">
                {mode === "signin"
                  ? "Sign in to access your PDF AI account"
                  : "Sign up to start chatting with your PDFs & web"}
              </p>
            </div>

            {/* Social Buttons (Google + GitHub) */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              {/* Google Button */}
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={socialLoading !== null || loading}
                className="flex items-center justify-center gap-2.5 py-2.5 px-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-medium text-xs sm:text-sm transition-all shadow-xs cursor-pointer disabled:opacity-60"
              >
                {socialLoading === "google" ? (
                  <Loader2 className="size-4 animate-spin text-slate-600" />
                ) : (
                  <svg className="size-4 shrink-0" viewBox="0 0 24 24">
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
                <span>Google</span>
              </button>

              {/* GitHub Button */}
              <button
                type="button"
                onClick={handleGithubLogin}
                disabled={socialLoading !== null || loading}
                className="flex items-center justify-center gap-2.5 py-2.5 px-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-medium text-xs sm:text-sm transition-all shadow-xs cursor-pointer disabled:opacity-60"
              >
                {socialLoading === "github" ? (
                  <Loader2 className="size-4 animate-spin text-slate-600" />
                ) : (
                  <svg className="size-4 shrink-0 fill-slate-900" viewBox="0 0 24 24">
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                    />
                  </svg>
                )}
                <span>GitHub</span>
              </button>
            </div>

            {/* Divider */}
            <div className="relative flex items-center justify-center my-6">
              <div className="border-t border-slate-200 w-full" />
              <span className="bg-white px-3 text-[11px] text-slate-400 font-semibold uppercase tracking-wider shrink-0">
                OR
              </span>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === "signup" && (
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-800">Full Name</Label>
                  <Input
                    type="text"
                    placeholder="Alex Morgan"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="rounded-xl border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 text-xs sm:text-sm py-2.5 focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:border-transparent shadow-2xs"
                    required
                  />
                </div>
              )}

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-800">Email Address</Label>
                <Input
                  type="email"
                  placeholder="email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="rounded-xl border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 text-xs sm:text-sm py-2.5 focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:border-transparent shadow-2xs"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-800">Password</Label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="rounded-xl border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 text-xs sm:text-sm py-2.5 pr-10 focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:border-transparent shadow-2xs"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOff className="size-4" />
                    ) : (
                      <Eye className="size-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-[#4338ca] hover:bg-[#3730a3] text-white font-semibold py-3 rounded-xl transition-all shadow-md text-sm mt-3 cursor-pointer"
              >
                {loading ? (
                  <Loader2 className="size-4.5 animate-spin" />
                ) : (
                  <span>{mode === "signin" ? "Sign In" : "Create Account"}</span>
                )}
              </Button>
            </form>

            {/* Bottom Links */}
            <div className="mt-6 flex flex-wrap items-center justify-between gap-2 text-xs">
              <button
                type="button"
                onClick={handleForgotPassword}
                className="font-medium text-indigo-600 hover:text-indigo-800 hover:underline transition-colors cursor-pointer"
              >
                Forgot Password?
              </button>

              <div className="text-slate-500">
                {mode === "signin" ? (
                  <>
                    Don&apos;t have an account?{" "}
                    <button
                      type="button"
                      onClick={() => setMode("signup")}
                      className="font-semibold text-indigo-600 hover:text-indigo-800 hover:underline transition-colors cursor-pointer ml-1"
                    >
                      Sign Up
                    </button>
                  </>
                ) : (
                  <>
                    Already have an account?{" "}
                    <button
                      type="button"
                      onClick={() => setMode("signin")}
                      className="font-semibold text-indigo-600 hover:text-indigo-800 hover:underline transition-colors cursor-pointer ml-1"
                    >
                      Sign In
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </main>

        {/* ---------------- 4. BOTTOM FOOTER ---------------- */}
        <footer className="py-5 text-center text-xs text-blue-100/70">
          <p>&copy; {new Date().getFullYear()} PDF AI RAG Studio. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
}