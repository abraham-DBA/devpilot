"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createModule } from "@/actions/modules";
import { Navbar } from "@/components/layout/Navbar";
import { Calendar, User, FileText, Code, Loader2, AlertCircle, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { formatDate } from "@/lib/utils";

type Member = {
  id: string;
  name: string;
  email: string;
  role: string;
};

type Project = {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
};

type Props = {
  project: Project;
  members: Member[];
};

export function ModuleForm({ project, members }: Props) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [deadline, setDeadline] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Module name is required.");
      return;
    }
    if (!deadline) {
      setError("Please specify a deadline date.");
      return;
    }

    const pStart = new Date(project.start_date).getTime();
    const pEnd = new Date(project.end_date).getTime();
    const mDeadline = new Date(deadline).getTime();

    if (mDeadline < pStart || mDeadline > pEnd) {
      setError(
        `Module deadline must fall within project duration range (${formatDate(
          project.start_date
        )} - ${formatDate(project.end_date)}).`
      );
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await createModule({
        projectId: project.id,
        name: name.trim(),
        description: description.trim() || undefined,
        assignedTo: assignedTo || undefined,
        deadline: new Date(deadline).toISOString(),
      });

      if (!result.success) {
        setError(result.error || "Failed to define module.");
      } else {
        router.refresh();
        router.push(`/projects/${project.id}`);
      }
    } catch (err) {
      console.error("Module creation error:", err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const getRoleLabel = (role: string) => {
    if (role === "developer") return "Developer";
    if (role === "team_lead") return "Team Lead";
    if (role === "project_manager") return "Manager";
    return "";
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar userName="" userRole="" />

      <main className="flex-1 max-w-3xl w-full mx-auto p-6 md:p-8 flex flex-col gap-6">
        {/* Back navigation */}
        <div>
          <Link
            href={`/projects/${project.id}`}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-text-secondary hover:text-accent transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to Project Workspace
          </Link>
        </div>

        {/* Title */}
        <div className="flex flex-col gap-1.5">
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-text-primary">
            Add a Module to Project
          </h1>
          <p className="text-xs text-text-secondary">
            Workspace: <span className="font-semibold text-accent">{project.name}</span> • Project Schedule bounds: {formatDate(project.start_date)} - {formatDate(project.end_date)}
          </p>
        </div>

        {error && (
          <div className="p-3.5 bg-error-light text-error-foreground border border-error-light rounded-lg flex items-start gap-2 text-xs">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Form Card */}
        <form onSubmit={handleSubmit} className="bg-surface border border-border rounded-2xl p-6 md:p-8 shadow-sm flex flex-col gap-6">
          {/* Module Name */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-text-secondary" htmlFor="module-name">
              MODULE NAME <span className="text-error">*</span>
            </label>
            <div className="relative flex items-center">
              <Code className="absolute left-3 h-4 w-4 text-text-muted" />
              <input
                id="module-name"
                type="text"
                required
                disabled={isLoading}
                className="w-full bg-surface border border-border rounded-lg pl-10 pr-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:ring-2 focus:ring-accent focus:border-transparent outline-none transition-all"
                placeholder="e.g. Email Auth Logic"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          </div>

          {/* Description */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-text-secondary" htmlFor="module-desc">
              DESCRIPTION / SCOPE
            </label>
            <div className="relative flex items-start">
              <FileText className="absolute left-3 top-3 h-4 w-4 text-text-muted" />
              <textarea
                id="module-desc"
                rows={3}
                disabled={isLoading}
                className="w-full bg-surface border border-border rounded-lg pl-10 pr-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:ring-2 focus:ring-accent focus:border-transparent outline-none transition-all"
                placeholder="Describe endpoints, schemas, or specific logic instructions."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>

          {/* Owner Assignment (select) */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-text-secondary" htmlFor="assigned-owner">
              ASSIGNED DEVELOPER / OWNER
            </label>
            <div className="relative flex items-center">
              <User className="absolute left-3 h-4 w-4 text-text-muted" />
              <select
                id="assigned-owner"
                disabled={isLoading}
                className="w-full bg-surface border border-border rounded-lg pl-10 pr-3 py-2 text-sm text-text-primary focus:ring-2 focus:ring-accent focus:border-transparent outline-none transition-all appearance-none cursor-pointer"
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
              >
                <option value="">Select owner (Unassigned)...</option>
                {members.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.name} ({getRoleLabel(member.role)})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Deadline Picker */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-text-secondary" htmlFor="module-deadline">
              DEADLINE <span className="text-error">*</span>
            </label>
            <div className="relative flex items-center">
              <Calendar className="absolute left-3 h-4 w-4 text-text-muted" />
              <input
                id="module-deadline"
                type="date"
                required
                disabled={isLoading}
                className="w-full bg-surface border border-border rounded-lg pl-10 pr-3 py-2 text-sm text-text-primary focus:ring-2 focus:ring-accent focus:border-transparent outline-none transition-all"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
              />
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-10 inline-flex items-center justify-center gap-2 rounded-lg bg-accent text-accent-foreground text-sm font-semibold hover:bg-accent-dark disabled:opacity-50 transition-all shadow-sm cursor-pointer mt-2"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <span>Add Module to Scope</span>
            )}
          </button>
        </form>
      </main>
    </div>
  );
}
