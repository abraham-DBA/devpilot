import Link from "next/link";
import { ModulesList } from "./ModulesList";
import { ActivityFeed } from "./ActivityFeed";
import { calculateProjectHealth, formatDate } from "@/lib/utils";
import { 
  ChevronLeft, 
  Calendar, 
  Users, 
  Plus, 
  CheckCircle2, 
  AlertTriangle, 
  AlertCircle 
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
  const health = calculateProjectHealth(project.start_date, project.end_date, project.progress);

  // Border configurations based on calculated project health
  const borderStyle =
    health === "high_risk"
      ? "border-t-4 border-t-error"
      : health === "at_risk"
      ? "border-t-4 border-t-warning"
      : "";

  // Schedule math for delay explanation banner
  const start = new Date(project.start_date).getTime();
  const end = new Date(project.end_date).getTime();
  const now = Date.now();
  const totalDuration = end - start;
  const timeElapsed = now - start;
  const timeUsedPercentage = Math.min(Math.max((timeElapsed / totalDuration) * 100, 0), 100);
  const lag = Math.round(timeUsedPercentage - project.progress);

  const getHealthBadge = () => {
    switch (health) {
      case "high_risk":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-error-light text-error-foreground border border-error-light shadow-sm">
            <AlertCircle className="h-4 w-4" />
            High Risk
          </span>
        );
      case "at_risk":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-warning-light text-warning-foreground border border-warning-light shadow-sm">
            <AlertTriangle className="h-4 w-4" />
            At Risk
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-success-lightest text-success-foreground border border-success-light shadow-sm">
            <CheckCircle2 className="h-4 w-4" />
            On Track
          </span>
        );
    }
  };

  const getRoleLabel = (role: string) => {
    if (role === "developer") return "Developer";
    if (role === "team_lead") return "Team Lead";
    if (role === "project_manager") return "Manager";
    return "";
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Navigation Breadcrumb */}
      <div>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-text-secondary hover:text-accent transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Projects Workspace
        </Link>
      </div>

      {/* Project Banner Header Card */}
      <div className={`bg-surface border border-border ${borderStyle} rounded-2xl p-6 md:p-8 shadow-sm flex flex-col gap-5`}>
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="flex flex-col gap-1.5 max-w-2xl">
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-text-primary">
              {project.name}
            </h1>
            <p className="text-xs md:text-sm text-text-secondary leading-relaxed">
              {project.description || "No project description available."}
            </p>
          </div>
          <div className="shrink-0">{getHealthBadge()}</div>
        </div>

        {/* Divider */}
        <div className="h-px bg-border w-full"></div>

        {/* Timelines and Progress summary */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-text-secondary font-medium">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-text-muted" />
              <span>Timeline:</span>
              <span className="text-text-primary font-bold">
                {formatDate(project.start_date)} - {formatDate(project.end_date)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-text-muted" />
              <span>Team Strength:</span>
              <span className="text-text-primary font-bold">
                {members.length} {members.length === 1 ? "member" : "members"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4 min-w-[200px] max-w-sm w-full sm:w-auto">
            <div className="flex flex-col gap-1 w-full">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-text-secondary uppercase tracking-wider text-[9px]">
                  Workspace Progress
                </span>
                <span className="text-text-primary">{Math.round(project.progress)}%</span>
              </div>
              <div className="w-full bg-border h-2 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    project.progress === 100
                      ? "bg-success"
                      : health === "high_risk"
                      ? "bg-error"
                      : health === "at_risk"
                      ? "bg-warning"
                      : "bg-accent"
                  }`}
                  style={{ width: `${project.progress}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Schedule Delay Warning Banner */}
      {health === "high_risk" && (
        <div className="bg-error-light border border-error-light text-error-foreground rounded-2xl p-4 flex items-start gap-3.5 shadow-sm">
          <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
          <div className="flex flex-col gap-1">
            <span className="text-xs font-bold uppercase tracking-wider">Critical Schedule Delay Alert</span>
            <p className="text-xs leading-relaxed">
              This project has consumed <strong>{Math.round(timeUsedPercentage)}%</strong> of its schedule, but progress is only at <strong>{Math.round(project.progress)}%</strong> (resulting in a timeline lag deficit of <strong>{lag}%</strong>). Please review active blockers below to expedite delivery.
            </p>
          </div>
        </div>
      )}

      {health === "at_risk" && (
        <div className="bg-warning-light border border-warning-light text-warning-foreground rounded-2xl p-4 flex items-start gap-3.5 shadow-sm">
          <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
          <div className="flex flex-col gap-1">
            <span className="text-xs font-bold uppercase tracking-wider">Schedule Slippage Risk</span>
            <p className="text-xs leading-relaxed">
              This project has consumed <strong>{Math.round(timeUsedPercentage)}%</strong> of its schedule, but progress lags behind at <strong>{Math.round(project.progress)}%</strong> (a delay gap of <strong>{lag}%</strong>). Monitor active modules to prevent milestone drift.
            </p>
          </div>
        </div>
      )}

      {/* Main Grid Layout (Modules & Sidebar) */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Modules Section */}
        <div className="lg:col-span-3 flex flex-col gap-6">
          {/* Modules Table Card */}
          <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h2 className="text-sm font-bold text-text-primary uppercase tracking-wider text-xs">
                Project Modules
              </h2>
              {canManage && (
                <Link
                  href={`/projects/${project.id}/modules/new`}
                  className="inline-flex h-8 items-center justify-center gap-1.5 px-3 rounded-lg bg-accent hover:bg-accent-dark text-accent-foreground text-xs font-semibold shadow-sm transition-all cursor-pointer"
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

        {/* Sidebar Members Section */}
        <div className="lg:col-span-1 bg-surface border border-border rounded-2xl p-5 shadow-sm flex flex-col gap-4">
          <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider border-b border-border pb-2.5">
            Project Team Members
          </h3>
          <div className="flex flex-col gap-3">
            {members.map((member) => (
              <div key={member.id} className="flex items-center justify-between gap-3 p-1">
                <div className="flex items-center gap-2.5">
                  <div className="h-7 w-7 rounded-full bg-accent-muted text-accent font-bold text-xs flex items-center justify-center border border-accent-light uppercase">
                    {member.name.slice(0, 2)}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-text-primary leading-tight">
                      {member.name}
                    </span>
                    <span className="text-[10px] text-text-secondary leading-none mt-0.5">
                      {member.email}
                    </span>
                  </div>
                </div>
                <span className="text-[9px] font-bold text-accent bg-accent-muted border border-accent-light px-1.5 py-0.25 rounded uppercase tracking-wider">
                  {getRoleLabel(member.role)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
