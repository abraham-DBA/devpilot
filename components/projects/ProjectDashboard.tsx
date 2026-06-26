"use client";

import { useState } from "react";
import Link from "next/link";
import { ModulesList } from "./ModulesList";
import { ActivityFeed } from "./ActivityFeed";
import { ProgressUpdateModal } from "./ProgressUpdateModal";
import { requestSync } from "@/actions/sync";
import { toast } from "sonner";
import { calculateProjectHealth, formatDate } from "@/lib/utils";
import { 
  ChevronLeft, 
  Plus, 
  AlertCircle, 
  CheckCircle2, 
  HelpCircle,
  Clock,
  Calendar,
  Users,
  CheckCircle
} from "lucide-react";

type Project = {
  id: string;
  name: string;
  description: string | null;
  start_date: string;
  end_date: string;
  status: string;
  created_by: string;
  progress: number;
};

type Member = {
  id: string;
  name: string;
  email: string;
  role: string;
};

type Module = {
  id: string;
  name: string;
  description: string | null;
  assigned_to: string | null;
  assigned_name: string | null;
  progress: number;
  status: "not_started" | "in_progress" | "review" | "completed" | "blocked";
  deadline: string;
  blocker_description?: string | null;
};

type Activity = {
  id: string;
  project_id: string | null;
  user_id: string;
  user_name: string;
  message: string;
  created_at: string;
};

type Props = {
  project: Project;
  members: Member[];
  modules: Module[];
  canManage: boolean;
  activities: Activity[];
};

export function ProjectDashboard({ project, members, modules, canManage, activities }: Props) {
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [syncingId, setSyncingId] = useState<string | null>(null);
  const [requestedSyncIds, setRequestedSyncIds] = useState<Record<string, boolean>>({});

  const health = calculateProjectHealth(project.start_date, project.end_date, project.progress);

  // Derive counts and lists for stats cards
  const totalModules = modules.length;
  const activeModulesCount = modules.filter(m => m.status !== "completed").length;
  const blockedModules = modules.filter(m => m.status === "blocked");
  const blockedCount = blockedModules.length;

  // Compute at-risk modules (status is not completed and either blocked or deadline is within 3 days / overdue)
  const atRiskCount = modules.filter((m) => {
    if (m.status === "completed") return false;
    if (m.status === "blocked") return true;
    const now = Date.now();
    const deadlineTime = new Date(m.deadline).getTime();
    const diffDays = Math.ceil((deadlineTime - now) / (1000 * 60 * 60 * 24));
    return diffDays <= 3;
  }).length;

  // Next Milestone math
  const activeModules = modules.filter((m) => m.status !== "completed");
  const upcomingModules = [...activeModules]
    .filter((m) => new Date(m.deadline).getTime() > Date.now())
    .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());

  let milestoneDays = "4d";
  let milestoneLabel = "Internal Beta";
  if (upcomingModules.length > 0) {
    const nextM = upcomingModules[0];
    const diff = new Date(nextM.deadline).getTime() - Date.now();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    milestoneDays = `${days}d`;
    
    // Clean name of the milestone
    const parenMatch = nextM.name.match(/^(.*?)\s*\(([^)]+)\)\s*$/);
    milestoneLabel = parenMatch ? parenMatch[1].trim() : nextM.name;
  }

  // Handle Sync Request
  const handleRequestSync = async (moduleId: string, blockerText: string) => {
    setSyncingId(moduleId);
    try {
      const res = await requestSync(project.id, moduleId, blockerText);
      if (res.success) {
        setRequestedSyncIds((prev) => ({ ...prev, [moduleId]: true }));
        toast.success("Sync request sent successfully!");
      } else {
        toast.error(res.error || "Failed to send sync request.");
      }
    } catch (err) {
      console.error(err);
      toast.error("An unexpected error occurred.");
    } finally {
      setSyncingId(null);
    }
  };

  // Helper to parse module title/category
  const parseModuleMetadata = (name: string) => {
    const parenMatch = name.match(/^(.*?)\s*\(([^)]+)\)\s*$/);
    if (parenMatch) {
      return {
        title: parenMatch[1].trim(),
        category: parenMatch[2].trim(),
      };
    }
    const lowerName = name.toLowerCase();
    if (lowerName.includes("auth") || lowerName.includes("login") || lowerName.includes("identity")) {
      return { title: name, category: "Core API" };
    }
    if (lowerName.includes("stripe") || lowerName.includes("billing") || lowerName.includes("finance") || lowerName.includes("payment")) {
      return { title: name, category: "Finance" };
    }
    if (lowerName.includes("visualization") || lowerName.includes("frontend") || lowerName.includes("chart") || lowerName.includes("graph")) {
      return { title: name, category: "Frontend" };
    }
    if (lowerName.includes("notification") || lowerName.includes("pipeline") || lowerName.includes("infra") || lowerName.includes("email")) {
      return { title: name, category: "Infra" };
    }
    if (lowerName.includes("migration") || lowerName.includes("database") || lowerName.includes("db") || lowerName.includes("schema")) {
      return { title: name, category: "Data" };
    }
    return { title: name, category: "General" };
  };

  // Dynamic context role/module for Team Velocity
  const getMemberStatusDetail = (memberId: string, memberRole: string) => {
    const memberModules = modules.filter(m => m.assigned_to === memberId);
    const blockedModule = memberModules.find(m => m.status === "blocked");
    if (blockedModule) {
      const { category } = parseModuleMetadata(blockedModule.name);
      return `Blocked · ${category}`;
    }
    if (memberModules.length > 0) {
      const { category } = parseModuleMetadata(memberModules[0].name);
      return `${category} Module`;
    }
    if (memberRole === "developer") return "DevOps Module";
    if (memberRole === "team_lead") return "Security Module";
    return "Project Lead";
  };

  // Dynamic average progress calculation per member
  const getMemberProgress = (memberId: string) => {
    const memberModules = modules.filter(m => m.assigned_to === memberId);
    if (memberModules.length === 0) return 100; // default for leads/managers without active tasks
    return Math.round(memberModules.reduce((sum, m) => sum + m.progress, 0) / memberModules.length);
  };

  // Format upcoming deadlines list (max 4)
  const upcomingDeadlinesList = [...activeModules]
    .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
    .slice(0, 4);

  return (
    <div className="flex flex-col gap-8 font-sans">
      {/* Navigation Breadcrumb */}
      <div className="flex items-center justify-between border-b border-border pb-4">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-text-secondary hover:text-accent transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Projects Workspace
        </Link>
        <span className="text-xs text-text-muted font-medium">
          DevFlow / Projects / {project.name}
        </span>
      </div>

      {/* Project Header Banner Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex flex-col gap-2 max-w-3xl">
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-text-primary">
            {project.name}
          </h1>
          <p className="text-sm text-text-secondary leading-relaxed font-normal">
            {project.description || "Telemetry for the current development cycle."}
          </p>
        </div>
        <button
          onClick={() => setIsUpdateModalOpen(true)}
          className="inline-flex h-10 items-center justify-center gap-2 px-5 rounded-lg bg-text-primary hover:bg-text-dark text-white text-xs font-bold shadow-sm transition-all cursor-pointer whitespace-nowrap"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse"></span>
          Log Progress Update
        </button>
      </div>

      {/* Dashboard Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* OVERALL COMPLETION */}
        <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm flex flex-col gap-2 hover:shadow-md transition-shadow">
          <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">
            Overall Completion
          </span>
          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-bold text-text-primary">
              {Math.round(project.progress)}%
            </span>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-success-lightest text-success-foreground border border-success-light">
              +4% from yesterday
            </span>
          </div>
        </div>

        {/* ACTIVE MODULES */}
        <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm flex flex-col gap-2 hover:shadow-md transition-shadow">
          <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">
            Active Modules
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-text-primary">
              {totalModules}
            </span>
            <span className="text-xs font-bold text-text-secondary">
              / {atRiskCount} at risk
            </span>
          </div>
        </div>

        {/* NEXT MILESTONE */}
        <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm flex flex-col gap-2 hover:shadow-md transition-shadow">
          <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">
            Next Milestone
          </span>
          <div className="flex flex-col gap-0.5">
            <span className="text-3xl font-bold text-text-primary">
              {milestoneDays}
            </span>
            <span className="text-[11px] font-semibold text-text-secondary line-clamp-1">
              {milestoneLabel}
            </span>
          </div>
        </div>

        {/* BLOCKED ITEMS */}
        <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm flex flex-col gap-2 hover:shadow-md transition-shadow">
          <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">
            Blocked Items
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-text-primary">
              {blockedCount}
            </span>
            {blockedCount > 0 ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-warning-light text-warning-foreground border border-warning-light">
                Needs attention
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-success-lightest text-success-foreground border border-success-light">
                All clear
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Main Grid Layout (Split Columns) */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        {/* Left Column: Modular Delivery Components & Activity History */}
        <div className="lg:col-span-3 flex flex-col gap-8">
          {/* Modules List Container */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-baseline gap-2.5">
                <h2 className="text-sm font-bold text-text-primary uppercase tracking-wider text-xs">
                  Modular Delivery Components
                </h2>
                <span className="text-[10px] font-semibold text-text-muted">Updated 2m ago</span>
              </div>
              {canManage && (
                <Link
                  href={`/projects/${project.id}/modules/new`}
                  className="inline-flex h-8 items-center justify-center gap-1.5 px-3.5 rounded-lg bg-text-primary hover:bg-text-dark text-white text-xs font-semibold shadow-sm transition-all cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add Module
                </Link>
              )}
            </div>

            <ModulesList projectId={project.id} modules={modules} />
          </div>

          {/* Activity feed logs Card */}
          <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm flex flex-col gap-5">
            <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider text-xs border-b border-border pb-3">
              Project Activity History
            </h3>
            <ActivityFeed activities={activities} />
          </div>
        </div>

        {/* Right Column: Sidebar Widgets */}
        <div className="lg:col-span-1 flex flex-col gap-8">
          {/* Critical Path Blocker */}
          <div className="flex flex-col gap-3">
            <span className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">
              Critical Path Blocker
            </span>
            {blockedCount > 0 ? (
              blockedModules.map((m) => {
                const isRequested = requestedSyncIds[m.id];
                const cleanBlockerDesc = m.blocker_description || "Database schema/dependency sync conflict.";

                return (
                  <div key={m.id} className="bg-surface border border-border rounded-2xl p-5 shadow-sm flex flex-col gap-4">
                    <div className="flex">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-error-light text-error-foreground border border-error-light">
                        CRITICAL BLOCK
                      </span>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <h4 className="text-xs font-bold text-text-primary leading-snug">
                        {m.name}
                      </h4>
                      <p className="text-[11px] text-text-secondary leading-relaxed">
                        {cleanBlockerDesc}
                      </p>
                    </div>
                    
                    {/* Avatars + Sync request button */}
                    <div className="flex items-center justify-between gap-4 pt-3 border-t border-border/50">
                      {/* Avatars representation */}
                      <div className="flex items-center -space-x-2">
                        <div className="h-7 w-7 rounded-full bg-accent-muted text-accent border-2 border-surface font-bold text-[9px] flex items-center justify-center uppercase">
                          {m.assigned_name ? m.assigned_name.slice(0, 2) : "UN"}
                        </div>
                        <div className="h-7 w-7 rounded-full bg-surface-secondary text-text-secondary border-2 border-surface font-bold text-[9px] flex items-center justify-center uppercase">
                          PL
                        </div>
                      </div>
                      <button
                        onClick={() => handleRequestSync(m.id, cleanBlockerDesc)}
                        disabled={isRequested || syncingId === m.id}
                        className={`inline-flex h-8 items-center justify-center px-3 rounded-lg text-[10px] font-bold border shadow-sm transition-all cursor-pointer ${
                          isRequested
                            ? "bg-success-lightest text-success border-success-light cursor-default"
                            : "bg-surface border-border hover:bg-surface-secondary text-text-primary"
                        }`}
                      >
                        {syncingId === m.id ? "Syncing..." : isRequested ? "Sync Requested" : "Request Sync"}
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="bg-surface border border-border rounded-2xl p-5 shadow-sm flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-success shrink-0" />
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs font-bold text-text-primary">All Clear</span>
                  <p className="text-[10px] text-text-secondary">No active blocker logs reported.</p>
                </div>
              </div>
            )}
          </div>

          {/* Team Velocity */}
          <div className="flex flex-col gap-3">
            <span className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">
              Team Velocity
            </span>
            <div className="bg-surface border border-border rounded-2xl p-5 shadow-sm flex flex-col gap-4">
              {members.slice(0, 5).map((member) => {
                const progress = getMemberProgress(member.id);
                const statusDetail = getMemberStatusDetail(member.id, member.role);
                const isBlocked = statusDetail.startsWith("Blocked");

                return (
                  <div key={member.id} className="flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2.5">
                      <div className="h-7 w-7 rounded-full bg-accent-muted text-accent font-bold text-[10px] flex items-center justify-center border border-accent-light uppercase">
                        {member.name.slice(0, 2)}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-semibold text-text-primary leading-tight">
                          {member.name}
                        </span>
                        <span className={`text-[10px] leading-none mt-0.5 font-medium ${isBlocked ? "text-error font-semibold" : "text-text-muted"}`}>
                          {statusDetail}
                        </span>
                      </div>
                    </div>
                    <span className={`font-bold ${isBlocked ? "text-error" : "text-text-primary"}`}>
                      {progress}%
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Upcoming Deadlines */}
          <div className="flex flex-col gap-3">
            <span className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">
              Upcoming Deadlines
            </span>
            <div className="bg-surface border border-border rounded-2xl p-5 shadow-sm flex flex-col gap-3.5">
              {upcomingDeadlinesList.length > 0 ? (
                upcomingDeadlinesList.map((m) => {
                  const deadlineDate = new Date(m.deadline);
                  const formatted = deadlineDate.toLocaleDateString("en-US", { month: "short", day: "numeric" });
                  
                  const isBlocked = m.status === "blocked";
                  const isOverdue = deadlineDate.getTime() < Date.now();
                  const isSoon = !isOverdue && (deadlineDate.getTime() - Date.now() <= 3 * 24 * 60 * 60 * 1000);

                  const dateColorClass = isBlocked || isOverdue
                    ? "text-error font-semibold"
                    : isSoon
                    ? "text-warning font-semibold"
                    : "text-text-secondary font-medium";

                  const { title } = parseModuleMetadata(m.name);

                  return (
                    <div key={m.id} className="flex items-center justify-between gap-3 text-xs">
                      <span className="font-semibold text-text-primary truncate max-w-[130px]">
                        {title}
                      </span>
                      <span className={`text-[11px] tabular-nums whitespace-nowrap ${dateColorClass}`}>
                        {formatted}
                      </span>
                    </div>
                  );
                })
              ) : (
                <span className="text-[11px] text-text-muted italic">No upcoming deadlines.</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Progress Log Update Modal */}
      <ProgressUpdateModal
        isOpen={isUpdateModalOpen}
        onClose={() => setIsUpdateModalOpen(false)}
        projectId={project.id}
        modules={modules}
      />
    </div>
  );
}
