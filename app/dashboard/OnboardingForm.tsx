"use client";

import { useState } from "react";
import { saveProfile } from "@/actions/profile";
import { useRouter } from "next/navigation";
import { GitBranch, Shield, User, Loader2, AlertCircle } from "lucide-react";

type Props = {
  defaultName: string;
};

export function OnboardingForm({ defaultName }: Props) {
  const router = useRouter();
  const [name, setName] = useState(defaultName);
  const [role, setRole] = useState<"developer" | "team_lead" | "project_manager" | "">("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Please enter your display name");
      return;
    }
    if (!role) {
      setError("Please select a workspace role");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await saveProfile({
        name: name.trim(),
        role: role as "developer" | "team_lead" | "project_manager",
      });

      if (!result.success) {
        setError(result.error || "Failed to update profile data");
      } else {
        // Success: refresh to hide onboarding panel and load dashboard
        router.refresh();
      }
    } catch (err) {
      console.error("Onboarding error:", err);
      setError("An unexpected error occurred during setup");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center p-6 min-h-[calc(100vh-4rem)]">
      <div className="w-full max-w-md bg-surface border border-border rounded-2xl p-8 shadow-xl flex flex-col gap-6">
        <div className="flex flex-col items-center text-center gap-2">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-accent to-accent-dark flex items-center justify-center text-accent-foreground font-bold shadow-md shadow-accent/20">
            <GitBranch className="h-6 w-6" />
          </div>
          <h2 className="text-xl font-bold tracking-tight text-text-primary mt-2">
            Welcome to DevFlow!
          </h2>
          <p className="text-xs text-text-secondary leading-relaxed px-4">
            Let's customize your profile. Choose a workspace role to determine your coordination permissions.
          </p>
        </div>

        {error && (
          <div className="p-3 bg-error-light text-error-foreground border border-error-light rounded-lg flex items-start gap-2 text-xs">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* Name Field */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-text-secondary" htmlFor="onboard-name">
              DISPLAY NAME <span className="text-error">*</span>
            </label>
            <div className="relative flex items-center">
              <User className="absolute left-3 h-4 w-4 text-text-muted" />
              <input
                id="onboard-name"
                type="text"
                required
                className="w-full bg-surface border border-border rounded-lg pl-10 pr-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:ring-2 focus:ring-accent focus:border-transparent outline-none transition-all"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Role Select Field */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-text-secondary" htmlFor="onboard-role">
              WORKSPACE ROLE <span className="text-error">*</span>
            </label>
            <div className="relative flex items-center">
              <Shield className="absolute left-3 h-4 w-4 text-text-muted" />
              <select
                id="onboard-role"
                required
                className="w-full bg-surface border border-border rounded-lg pl-10 pr-3 py-2 text-sm text-text-primary focus:ring-2 focus:ring-accent focus:border-transparent outline-none transition-all appearance-none cursor-pointer"
                value={role}
                onChange={(e) => setRole(e.target.value as any)}
                disabled={isLoading}
              >
                <option value="" disabled>Select your role...</option>
                <option value="developer">Developer (Manage modules, update progress, log blockers)</option>
                <option value="team_lead">Team Lead (Coordinate modules, manage team members)</option>
                <option value="project_manager">Project Manager (Oversee schedules, handle priorities)</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-10 inline-flex items-center justify-center gap-2 rounded-lg bg-accent text-accent-foreground text-sm font-medium hover:bg-accent-dark disabled:opacity-50 transition-all shadow-sm cursor-pointer mt-2"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <span>Complete Setup</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
