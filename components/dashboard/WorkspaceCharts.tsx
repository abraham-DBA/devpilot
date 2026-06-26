"use client";

import Link from "next/link";
import { AlertCircle, CheckCircle2, ShieldCheck, Activity } from "lucide-react";

type Workload = {
  name: string;
  module_count: number;
};

type Blocker = {
  id: string;
  name: string;
  blocker_description: string | null;
  project_id: string;
  project_name: string;
  owner_name: string | null;
};

type Props = {
  completedModules: number;
  totalModules: number;
  developerWorkloads: Workload[];
  activeBlockersList: Blocker[];
};

export function WorkspaceCharts({
  completedModules,
  totalModules,
  developerWorkloads,
  activeBlockersList,
}: Props) {
  const completionPercentage =
    totalModules > 0 ? Math.round((completedModules / totalModules) * 100) : 0;

  // Max count to scale workload comparative bars
  const maxWorkload =
    developerWorkloads.length > 0
      ? Math.max(...developerWorkloads.map((dw) => dw.module_count), 1)
      : 1;

  return (
    <div className="flex flex-col gap-6">
      {/* Visual Analytics Grid Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Module Completion Ring Card */}
        <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm flex flex-col gap-5">
          <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider border-b border-border pb-3">
            Module Completion Ratio
          </h3>
          <div className="flex flex-col sm:flex-row items-center justify-around gap-6 py-4">
            {/* CSS-based radial conic ring visualizer */}
            <div 
              className="relative h-36 w-36 rounded-full flex items-center justify-center shadow-inner"
              style={{
                background: `conic-gradient(var(--color-accent) ${completionPercentage * 3.6}deg, var(--color-surface-secondary) 0deg)`,
              }}
            >
              {/* Inner overlay circle creating the ring mask */}
              <div className="absolute h-[116px] w-[116px] bg-surface rounded-full flex flex-col items-center justify-center shadow-sm">
                <span className="text-3xl font-black text-text-primary tracking-tight">
                  {completionPercentage}%
                </span>
                <span className="text-[9px] font-bold text-accent uppercase tracking-widest mt-0.5">
                  Complete
                </span>
              </div>
            </div>

            {/* Numeric Indicators */}
            <div className="flex flex-col gap-3.5 text-xs text-text-secondary">
              <div className="flex items-center gap-2.5">
                <div className="h-3 w-3 rounded-full bg-accent"></div>
                <div className="flex flex-col">
                  <span className="font-semibold text-text-primary">{completedModules} Modules</span>
                  <span className="text-[10px] text-text-muted uppercase tracking-wider">Completed / QA Ready</span>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="h-3 w-3 rounded-full bg-surface-secondary border border-border"></div>
                <div className="flex flex-col">
                  <span className="font-semibold text-text-primary">{totalModules - completedModules} Modules</span>
                  <span className="text-[10px] text-text-muted uppercase tracking-wider">In Progress / Pending</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Developer Workload comparative rows */}
        <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm flex flex-col gap-5">
          <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider border-b border-border pb-3">
            Developer Workload Distribution
          </h3>
          {developerWorkloads.length > 0 ? (
            <div className="flex flex-col gap-4 py-1 max-h-[170px] overflow-y-auto pr-1">
              {developerWorkloads.map((dw, i) => {
                const ratio = (dw.module_count / maxWorkload) * 100;
                return (
                  <div key={i} className="flex flex-col gap-1">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-text-primary">{dw.name}</span>
                      <span className="text-text-secondary">
                        {dw.module_count} {dw.module_count === 1 ? "module" : "modules"}
                      </span>
                    </div>
                    {/* Comparative bar */}
                    <div className="w-full bg-surface-secondary h-2.5 rounded-full overflow-hidden border border-border-light">
                      <div
                        className="bg-accent h-full rounded-full transition-all duration-500"
                        style={{ width: `${ratio}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center p-6 h-full min-h-[140px] gap-2">
              <Activity className="h-6 w-6 text-text-muted" />
              <span className="text-xs text-text-secondary font-medium">No workload metrics logged yet.</span>
            </div>
          )}
        </div>
      </div>

      {/* Outstanding Blockers list Panel */}
      <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm flex flex-col gap-4">
        <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider border-b border-border pb-3">
          Outstanding Active Blockers
        </h3>
        {activeBlockersList.length > 0 ? (
          <div className="flex flex-col gap-3">
            {activeBlockersList.map((blocker) => (
              <div
                key={blocker.id}
                className="bg-error-light border border-error-light rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:shadow-sm transition-shadow border-l-4 border-l-error"
              >
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-error shrink-0 mt-0.5" />
                  <div className="flex flex-col gap-1">
                    <Link
                      href={`/projects/${blocker.project_id}/modules/${blocker.id}`}
                      className="text-xs font-bold text-text-primary hover:text-error hover:underline transition-colors"
                    >
                      {blocker.name}
                    </Link>
                    <span className="text-[10px] text-text-secondary font-medium uppercase tracking-wide">
                      Project: {blocker.project_name}
                    </span>
                    <p className="text-xs text-error-foreground font-semibold mt-1">
                      Reason: {blocker.blocker_description || "No description logged."}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col items-start sm:items-end text-left sm:text-right shrink-0">
                  <span className="text-[10px] text-text-muted uppercase tracking-wider font-bold">Assigned Owner</span>
                  <span className="text-xs font-bold text-text-primary mt-0.5">
                    {blocker.owner_name || "Unassigned"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Empty Active Blocker State */
          <div className="border border-border border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center bg-surface-secondary gap-3">
            <div className="h-10 w-10 rounded-full bg-surface text-success flex items-center justify-center border border-border">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div className="max-w-xs flex flex-col gap-0.5">
              <h4 className="text-xs font-bold text-text-primary">No Active Blockers</h4>
              <p className="text-[11px] text-text-secondary leading-relaxed">
                All development pathways are clear! No blocked modules exist across active projects.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
