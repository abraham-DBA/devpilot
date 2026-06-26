"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth/client";
import { useRouter } from "next/navigation";
import { GitBranch, Mail, Lock, Loader2, AlertCircle } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      if (isSignUp) {
        const { data, error } = await authClient.signUp.email({
          email,
          password,
          name: email.split("@")[0],
        });

        if (error) {
          setErrorMsg(error.message || "Sign up failed");
        } else {
          // Auto sign-in after signup
          const signInRes = await authClient.signIn.email({ email, password });
          if (signInRes.error) {
            setErrorMsg(signInRes.error.message || "Sign up succeeded but sign in failed");
          } else {
            router.replace("/dashboard");
          }
        }
      } else {
        const { data, error } = await authClient.signIn.email({
          email,
          password,
        });

        if (error) {
          setErrorMsg(error.message || "Sign in failed");
        } else {
          router.replace("/dashboard");
        }
      }
    } catch (err: any) {
      console.error("Authentication error:", err);
      setErrorMsg(err.message || "An authentication error occurred. Please check your credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuth = async (provider: "google" | "github") => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const { error } = await authClient.signIn.social({
        provider,
        callbackURL: "/dashboard",
      });
      if (error) throw error;
    } catch (err: any) {
      console.error(`${provider} Auth error:`, err);
      setErrorMsg(err.message || `Could not authenticate with ${provider}.`);
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen items-center justify-center p-6 bg-background">
      {/* Container Card */}
      <div className="w-full max-w-md bg-surface border border-border rounded-2xl p-8 shadow-xl flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col items-center text-center gap-2">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-accent to-accent-dark flex items-center justify-center text-accent-foreground font-bold shadow-md shadow-accent/15">
            <GitBranch className="h-5 w-5" />
          </div>
          <h2 className="text-xl font-bold tracking-tight text-text-primary mt-2">
            {isSignUp ? "Create your DevFlow account" : "Sign in to DevFlow"}
          </h2>
          <p className="text-xs text-text-secondary">
            {isSignUp 
              ? "Start coordinating project modules and tracking delivery timelines." 
              : "Access your dashboard, manage modules, and update progress."
            }
          </p>
        </div>

        {/* Message Panels */}
        {errorMsg && (
          <div className="p-3.5 bg-error-light text-error-foreground border border-error-light rounded-lg flex items-start gap-2.5 text-xs">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3.5 bg-success-lightest text-success-foreground border border-success-light rounded-lg flex items-start gap-2.5 text-xs">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Auth Forms */}
        <form onSubmit={handleEmailAuth} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-text-secondary" htmlFor="email">
              EMAIL ADDRESS
            </label>
            <div className="relative flex items-center">
              <Mail className="absolute left-3 h-4 w-4 text-text-muted" />
              <input
                id="email"
                type="email"
                required
                className="w-full bg-surface border border-border rounded-lg pl-10 pr-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:ring-2 focus:ring-accent focus:border-transparent outline-none transition-all"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-text-secondary" htmlFor="password">
              PASSWORD
            </label>
            <div className="relative flex items-center">
              <Lock className="absolute left-3 h-4 w-4 text-text-muted" />
              <input
                id="password"
                type="password"
                required
                className="w-full bg-surface border border-border rounded-lg pl-10 pr-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:ring-2 focus:ring-accent focus:border-transparent outline-none transition-all"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-10 inline-flex items-center justify-center gap-2 rounded-lg bg-accent text-accent-foreground text-sm font-medium hover:bg-accent-dark disabled:opacity-50 transition-all shadow-sm cursor-pointer"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <span>{isSignUp ? "Sign Up" : "Sign In"}</span>
            )}
          </button>
        </form>

        {/* Separator */}
        <div className="flex items-center gap-2 my-1">
          <div className="h-px flex-1 bg-border"></div>
          <span className="text-[10px] font-bold text-text-muted tracking-wider uppercase">
            OR CONTINUE WITH
          </span>
          <div className="h-px flex-1 bg-border"></div>
        </div>

        {/* Social Authentication */}
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => handleOAuth("google")}
            disabled={isLoading}
            className="h-10 inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-surface text-xs font-semibold text-text-primary hover:bg-surface-secondary disabled:opacity-50 transition-all cursor-pointer"
          >
            {/* Google SVG Icon */}
            <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Google
          </button>

          <button
            type="button"
            onClick={() => handleOAuth("github")}
            disabled={isLoading}
            className="h-10 inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-surface text-xs font-semibold text-text-primary hover:bg-surface-secondary disabled:opacity-50 transition-all cursor-pointer"
          >
            <svg className="h-4 w-4 text-text-primary shrink-0" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
            </svg>
            GitHub
          </button>
        </div>

        {/* Footer Link */}
        <div className="text-center mt-2">
          <button
            type="button"
            onClick={() => {
              setIsSignUp(!isSignUp);
              setErrorMsg(null);
              setSuccessMsg(null);
            }}
            disabled={isLoading}
            className="text-xs text-accent hover:underline font-medium focus:outline-none cursor-pointer"
          >
            {isSignUp 
              ? "Already have an account? Sign In" 
              : "Don't have an account? Sign Up"
            }
          </button>
        </div>
      </div>
    </div>
  );
}
