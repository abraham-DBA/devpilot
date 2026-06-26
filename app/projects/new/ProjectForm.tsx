"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createProject } from "@/actions/projects";
import { Navbar } from "@/components/layout/Navbar";
import { Calendar, Users, FileText, FolderGit2, Loader2, AlertCircle, ChevronLeft } from "lucide-react";
import Link from "next/link";

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
};

type Props = {
  users: User[];
};

export function ProjectForm({ users }: Props) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleMemberToggle = (userId: string) => {
    setSelectedMembers((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Project name is required.");
      return;
    }
    if (!startDate || !endDate) {
      setError("Please specify both start and end dates.");
      return;
    }

    const start = new Date(startDate).getTime();
    const end = new Date(endDate).getTime();
    if (start > end) {
      setError("Start date must be before or equal to End date.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await createProject({
        name: name.trim(),
        description: description.trim() || undefined,
        startDate: new Date(startDate).toISOString(),
        endDate: new Date(endDate).toISOString(),
        memberIds: selectedMembers,
      });

      if (!result.success) {
        setError(result.error || "Failed to create project.");
      } else {
        router.refresh();
        router.push("/dashboard");
      }
    } catch (err) {
      console.error("Project creation error:", err);
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
        {/* Navigation Breadcrumb */}
        <div>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-text-secondary hover:text-accent transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
        </div>

        {/* Header */}
        <div className="flex flex-col gap-1">
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-text-primary">
            Create a New Project
          </h1>
          <p className="text-xs text-text-secondary">
            Set timelines, scopes, and map developer ownership to initialize coordination.
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
          {/* Project Name */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-text-secondary" htmlFor="project-name">
              PROJECT NAME <span className="text-error">*</span>
            </label>
            <div className="relative flex items-center">
              <FolderGit2 className="absolute left-3 h-4 w-4 text-text-muted" />
              <input
                id="project-name"
                type="text"
                required
                disabled={isLoading}
                className="w-full bg-surface border border-border rounded-lg pl-10 pr-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:ring-2 focus:ring-accent focus:border-transparent outline-none transition-all"
                placeholder="e.g. Client Billing Workspace"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          </div>

          {/* Description */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-text-secondary" htmlFor="project-desc">
              DESCRIPTION
            </label>
            <div className="relative flex items-start">
              <FileText className="absolute left-3 top-3 h-4 w-4 text-text-muted" />
              <textarea
                id="project-desc"
                rows={3}
                disabled={isLoading}
                className="w-full bg-surface border border-border rounded-lg pl-10 pr-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:ring-2 focus:ring-accent focus:border-transparent outline-none transition-all"
                placeholder="Provide a high-level summary of the code repository goals."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>

          {/* Timelines (Grid) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Start Date */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-text-secondary" htmlFor="start-date">
                START DATE <span className="text-error">*</span>
              </label>
              <div className="relative flex items-center">
                <Calendar className="absolute left-3 h-4 w-4 text-text-muted" />
                <input
                  id="start-date"
                  type="date"
                  required
                  disabled={isLoading}
                  className="w-full bg-surface border border-border rounded-lg pl-10 pr-3 py-2 text-sm text-text-primary focus:ring-2 focus:ring-accent focus:border-transparent outline-none transition-all"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
            </div>

            {/* End Date */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-text-secondary" htmlFor="end-date">
                END DATE <span className="text-error">*</span>
              </label>
              <div className="relative flex items-center">
                <Calendar className="absolute left-3 h-4 w-4 text-text-muted" />
                <input
                  id="end-date"
                  type="date"
                  required
                  disabled={isLoading}
                  className="w-full bg-surface border border-border rounded-lg pl-10 pr-3 py-2 text-sm text-text-primary focus:ring-2 focus:ring-accent focus:border-transparent outline-none transition-all"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Team Members List */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-text-secondary">
              TEAM MEMBERS
            </label>
            <p className="text-[10px] text-text-muted uppercase tracking-wider mb-1">
              Select workspace users to assign to this project
            </p>
            {users.length > 0 ? (
              <div className="border border-border rounded-lg bg-surface max-h-[200px] overflow-y-auto divide-y divide-border">
                {users.map((u) => {
                  const isChecked = selectedMembers.includes(u.id);
                  return (
                    <label
                      key={u.id}
                      className="flex items-center justify-between p-3 cursor-pointer hover:bg-surface-secondary transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          disabled={isLoading}
                          className="h-4 w-4 rounded border-border text-accent focus:ring-accent accent-accent cursor-pointer"
                          checked={isChecked}
                          onChange={() => handleMemberToggle(u.id)}
                        />
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold text-text-primary">{u.name}</span>
                          <span className="text-[11px] text-text-secondary">{u.email}</span>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-accent bg-accent-muted border border-accent-light px-2 py-0.5 rounded-md uppercase tracking-wide">
                        {getRoleLabel(u.role)}
                      </span>
                    </label>
                  );
                })}
              </div>
            ) : (
              <div className="border border-border border-dashed rounded-lg p-6 flex flex-col items-center justify-center text-center bg-surface-secondary">
                <Users className="h-6 w-6 text-text-muted mb-1" />
                <span className="text-xs text-text-secondary font-medium">No other users registered in this workspace yet.</span>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-10 inline-flex items-center justify-center gap-2 rounded-lg bg-accent text-accent-foreground text-sm font-semibold hover:bg-accent-dark disabled:opacity-50 transition-all shadow-sm cursor-pointer mt-2"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <span>Create Project Workspace</span>
            )}
          </button>
        </form>
      </main>
    </div>
  );
}
