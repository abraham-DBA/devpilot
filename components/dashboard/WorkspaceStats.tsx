import { FolderGit2, CheckCircle2, AlertCircle, ShieldAlert } from "lucide-react";

type Props = {
  totalProjects: number;
  completedProjects: number;
  activeBlockers: number;
  highRiskProjects: number;
};

export function WorkspaceStats({
  totalProjects,
  completedProjects,
  activeBlockers,
  highRiskProjects,
}: Props) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Total Projects */}
      <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
        <div className="flex flex-col gap-1">
          <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
            Total Projects
          </span>
          <span className="text-3xl font-semibold text-text-primary">
            {totalProjects}
          </span>
        </div>
        <div className="h-12 w-12 rounded-xl bg-accent-muted text-accent flex items-center justify-center">
          <FolderGit2 className="h-6 w-6" />
        </div>
      </div>

      {/* Completed Projects */}
      <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
        <div className="flex flex-col gap-1">
          <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
            Completed Projects
          </span>
          <span className="text-3xl font-semibold text-text-primary">
            {completedProjects}
          </span>
        </div>
        <div className="h-12 w-12 rounded-xl bg-success-lightest text-success flex items-center justify-center">
          <CheckCircle2 className="h-6 w-6" />
        </div>
      </div>

      {/* Active Blockers */}
      <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
        <div className="flex flex-col gap-1">
          <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
            Active Blockers
          </span>
          <span className="text-3xl font-semibold text-text-primary">
            {activeBlockers}
          </span>
        </div>
        <div className="h-12 w-12 rounded-xl bg-error-light text-error flex items-center justify-center">
          <AlertCircle className="h-6 w-6" />
        </div>
      </div>

      {/* High Risk Projects */}
      <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
        <div className="flex flex-col gap-1">
          <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
            High Risk
          </span>
          <span className="text-3xl font-semibold text-text-primary">
            {highRiskProjects}
          </span>
        </div>
        <div className="h-12 w-12 rounded-xl bg-warning-light text-warning flex items-center justify-center">
          <ShieldAlert className="h-6 w-6" />
        </div>
      </div>
    </div>
  );
}
