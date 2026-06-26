"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, AlertCircle, HelpCircle, CheckCircle, Clock } from "lucide-react";

type Module = {
  id: string;
  name: string;
  description: string | null;
  assigned_to: string | null;
  assigned_name: string | null; // Resolved developer name
  progress: number;
  status: "not_started" | "in_progress" | "review" | "completed" | "blocked";
  deadline: string;
};

type Props = {
  projectId: string;
  modules: Module[];
};

export function ModulesList({ projectId, modules }: Props) {
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<string>("all");

  const getStatusBadge = (status: Module["status"]) => {
    switch (status) {
      case "not_started":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-surface-secondary text-text-secondary border border-border">
            Not Started
          </span>
        );
      case "in_progress":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-info-light text-info-foreground border border-info-light">
            In Progress
          </span>
        );
      case "review":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-accent-muted text-accent border border-accent-light">
            Review
          </span>
        );
      case "completed":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-success-lightest text-success-foreground border border-success-light">
            Completed
          </span>
        );
      case "blocked":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-error-light text-error-foreground border border-error-light animate-pulse">
            <span className="h-1.5 w-1.5 rounded-full bg-error"></span>
            Blocked
          </span>
        );
    }
  };

  const getDeadlineBadge = (deadlineStr: string) => {
    const now = Date.now();
    const deadlineTime = new Date(deadlineStr).getTime();
    const diffTime = deadlineTime - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffTime < 0) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-error-light text-error-foreground border border-error-light">
          <AlertCircle className="h-3 w-3" />
          Overdue
        </span>
      );
    } else if (diffDays <= 3) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-warning-light text-warning-foreground border border-warning-light">
          <Clock className="h-3 w-3" />
          Due Soon
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-success-lightest text-success-foreground border border-success-light">
          <CheckCircle className="h-3 w-3" />
          On Track
        </span>
      );
    }
  };

  // Filter logic
  const filteredModules = modules.filter((m) => {
    const matchesSearch = m.name.toLowerCase().includes(search.toLowerCase());
    const matchesTab = activeTab === "all" || m.status === activeTab;
    return matchesSearch && matchesTab;
  });

  const tabs = [
    { id: "all", label: "All Modules" },
    { id: "not_started", label: "Not Started" },
    { id: "in_progress", label: "In Progress" },
    { id: "review", label: "Review" },
    { id: "completed", label: "Completed" },
    { id: "blocked", label: "Blocked" },
  ];

  return (
    <div className="flex flex-col gap-5">
      {/* Filtering Header controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-3">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-2">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  isActive
                    ? "bg-accent text-accent-foreground shadow-sm"
                    : "bg-surface border border-border text-text-secondary hover:text-text-primary hover:bg-surface-secondary"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Search Field */}
        <div className="relative w-full md:w-72 flex items-center">
          <Search className="absolute left-3 h-4 w-4 text-text-muted" />
          <input
            type="text"
            className="w-full bg-surface border border-border rounded-lg pl-9 pr-3 py-1.5 text-xs text-text-primary placeholder:text-text-muted focus:ring-2 focus:ring-accent focus:border-transparent outline-none transition-all"
            placeholder="Search modules..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Modules Listing Grid / Table */}
      {filteredModules.length > 0 ? (
        <div className="overflow-x-auto border border-border rounded-xl bg-surface shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-surface-muted">
                <th className="px-5 py-3 text-xs font-bold text-text-secondary uppercase tracking-wider">
                  Module Name
                </th>
                <th className="px-5 py-3 text-xs font-bold text-text-secondary uppercase tracking-wider">
                  Assigned Owner
                </th>
                <th className="px-5 py-3 text-xs font-bold text-text-secondary uppercase tracking-wider">
                  Average Progress
                </th>
                <th className="px-5 py-3 text-xs font-bold text-text-secondary uppercase tracking-wider">
                  Deadline Status
                </th>
                <th className="px-5 py-3 text-xs font-bold text-text-secondary uppercase tracking-wider">
                  State
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredModules.map((m) => (
                <tr
                  key={m.id}
                  className="hover:bg-surface-secondary transition-colors group"
                >
                  {/* Name Link */}
                  <td className="px-5 py-3.5">
                    <Link
                      href={`/projects/${projectId}/modules/${m.id}`}
                      className="text-sm font-semibold text-text-primary group-hover:text-accent transition-colors"
                    >
                      {m.name}
                    </Link>
                    {m.description && (
                      <p className="text-xs text-text-muted mt-0.5 line-clamp-1">
                        {m.description}
                      </p>
                    )}
                  </td>

                  {/* Owner */}
                  <td className="px-5 py-3.5 text-sm text-text-secondary">
                    {m.assigned_name ? (
                      <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded-full bg-accent-muted text-accent font-bold text-[10px] flex items-center justify-center border border-accent-light uppercase">
                          {m.assigned_name.slice(0, 2)}
                        </div>
                        <span className="font-medium text-text-primary">
                          {m.assigned_name}
                        </span>
                      </div>
                    ) : (
                      <span className="text-text-muted italic">Unassigned</span>
                    )}
                  </td>

                  {/* Progress bar */}
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3 min-w-[120px]">
                      <div className="w-full bg-border h-1.5 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            m.status === "completed"
                              ? "bg-success"
                              : m.status === "blocked"
                              ? "bg-error"
                              : "bg-accent"
                          }`}
                          style={{ width: `${m.progress}%` }}
                        ></div>
                      </div>
                      <span className="text-xs font-bold text-text-primary text-right w-8">
                        {m.progress}%
                      </span>
                    </div>
                  </td>

                  {/* Deadline status */}
                  <td className="px-5 py-3.5">
                    {getDeadlineBadge(m.deadline)}
                  </td>

                  {/* State badge */}
                  <td className="px-5 py-3.5">
                    {getStatusBadge(m.status)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        /* Empty State */
        <div className="border border-border border-dashed rounded-xl p-10 flex flex-col items-center justify-center text-center bg-surface gap-4">
          <div className="h-12 w-12 rounded-full bg-surface-secondary text-text-muted flex items-center justify-center border border-border">
            <HelpCircle className="h-6 w-6" />
          </div>
          <div className="max-w-md flex flex-col gap-1.5">
            <h4 className="text-sm font-bold text-text-primary">No Modules Found</h4>
            <p className="text-xs text-text-secondary leading-relaxed">
              {search || activeTab !== "all"
                ? "No modules match your current filters. Clear the search input or select other status categories."
                : "No modules have been defined for this project workspace yet."}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
