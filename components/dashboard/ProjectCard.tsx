import Link from "next/link";
import { calculateProjectHealth, formatDate } from "@/lib/utils";
import { Calendar, CheckCircle2, AlertTriangle, AlertCircle, Users } from "lucide-react";

type Props = {
  project: {
    id: string;
    name: string;
    description: string | null;
    start_date: string;
    end_date: string;
    status: string;
    created_at: string;
    member_count: number;
    progress: number; // Average progress of modules
  };
};

export function ProjectCard({ project }: Props) {
  const health = calculateProjectHealth(project.start_date, project.end_date, project.progress);

  // Border configurations based on calculated project health
  const borderStyle =
    health === "high_risk"
      ? "border-t-4 border-t-error border-x-border border-b-border"
      : health === "at_risk"
      ? "border-t-4 border-t-warning border-x-border border-b-border"
      : "border-border";

  const getHealthBadge = () => {
    switch (health) {
      case "high_risk":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-error-light text-error-foreground border border-error-light">
            <AlertCircle className="h-3.5 w-3.5" />
            High Risk
          </span>
        );
      case "at_risk":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-warning-light text-warning-foreground border border-warning-light">
            <AlertTriangle className="h-3.5 w-3.5" />
            At Risk
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-success-lightest text-success-foreground border border-success-light">
            <CheckCircle2 className="h-3.5 w-3.5" />
            On Track
          </span>
        );
    }
  };

  return (
    <Link href={`/projects/${project.id}`} className="block group">
      <div className={`bg-surface border ${borderStyle} rounded-2xl p-6 shadow-sm group-hover:shadow-md group-hover:scale-[1.01] transition-all flex flex-col gap-4 h-full min-h-[220px]`}>
        {/* Card Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-col gap-1">
            <h3 className="text-base font-bold text-text-primary group-hover:text-accent transition-colors">
              {project.name}
            </h3>
            <p className="text-xs text-text-secondary line-clamp-2 mt-0.5 leading-relaxed">
              {project.description || "No project description provided."}
            </p>
          </div>
          <div className="shrink-0">{getHealthBadge()}</div>
        </div>

        {/* Card Body - Dates & Members */}
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-auto text-xs text-text-secondary">
          <div className="flex items-center gap-1.5">
            <Calendar className="h-4 w-4 text-text-muted" />
            <span>
              {formatDate(project.start_date)} - {formatDate(project.end_date)}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <Users className="h-4 w-4 text-text-muted" />
            <span>
              {project.member_count} {project.member_count === 1 ? "member" : "members"}
            </span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="flex flex-col gap-1.5 mt-2">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-text-secondary uppercase tracking-wider text-[10px]">
              Avg Progress
            </span>
            <span className="text-text-primary font-bold">{Math.round(project.progress)}%</span>
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
    </Link>
  );
}
