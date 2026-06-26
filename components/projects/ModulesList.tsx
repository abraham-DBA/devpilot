"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, AlertCircle, HelpCircle, CheckCircle, Clock, ArrowRight } from "lucide-react";

type Module = {
  id: string;
  name: string;
  description: string | null;
  assigned_to: string | null;
  assigned_name: string | null; // Resolved developer name
  progress: number;
  status: "not_started" | "in_progress" | "review" | "completed" | "blocked";
  deadline: string;
  blocker_description?: string | null;
};

type Props = {
  projectId: string;
  modules: Module[];
};

export function ModulesList({ projectId, modules }: Props) {
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<string>("all");

  const getModuleStatusInfo = (m: Module) => {
    const now = Date.now();
    const deadlineTime = new Date(m.deadline).getTime();
    const diffTime = deadlineTime - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (m.status === "blocked") {
      return {
        label: "BLOCKED",
        className: "bg-error-light text-error-foreground border border-error-light",
        barColor: "bg-error",
        textLabelColor: "text-error-foreground",
      };
    }
    if (m.status === "completed") {
      return {
        label: "ON TRACK",
        className: "bg-success-lightest text-success-foreground border border-success-light",
        barColor: "bg-success",
        textLabelColor: "text-success-foreground",
      };
    }
    if (m.status === "review") {
      return {
        label: "ON TRACK",
        className: "bg-success-lightest text-success-foreground border border-success-light",
        barColor: "bg-accent",
        textLabelColor: "text-success-foreground",
      };
    }

    // Evaluate delay or risk based on deadline
    if (diffTime < 0) {
      return {
        label: "AT RISK",
        className: "bg-warning-light text-warning-foreground border border-warning-light",
        barColor: "bg-warning",
        textLabelColor: "text-warning-foreground",
      };
    } else if (diffDays <= 3) {
      return {
        label: "AT RISK",
        className: "bg-warning-light text-warning-foreground border border-warning-light",
        barColor: "bg-warning",
        textLabelColor: "text-warning-foreground",
      };
    } else {
      return {
        label: "ON TRACK",
        className: "bg-success-lightest text-success-foreground border border-success-light",
        barColor: "bg-success",
        textLabelColor: "text-success-foreground",
      };
    }
  };

  const getDeadlineText = (deadlineStr: string) => {
    const date = new Date(deadlineStr);
    const options: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" };
    const formattedDate = date.toLocaleDateString("en-US", options);

    const now = Date.now();
    const deadlineTime = date.getTime();
    const diffTime = deadlineTime - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffTime < 0) {
      return `${formattedDate} · Overdue`;
    } else if (diffDays === 0) {
      return `${formattedDate} · Due today`;
    } else if (diffDays === 1) {
      return `${formattedDate} · 1d left`;
    } else {
      return `${formattedDate} · ${diffDays}d left`;
    }
  };

  // Helper to dynamically extract category/label from module name
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
    if (lowerName.includes("visualization") || lowerName.includes("frontend") || lowerName.includes("chart") || lowerName.includes("graph") || lowerName.includes("view")) {
      return { title: name, category: "Frontend" };
    }
    if (lowerName.includes("notification") || lowerName.includes("pipeline") || lowerName.includes("infra") || lowerName.includes("email") || lowerName.includes("queue")) {
      return { title: name, category: "Infra" };
    }
    if (lowerName.includes("migration") || lowerName.includes("database") || lowerName.includes("db") || lowerName.includes("schema") || lowerName.includes("sql")) {
      return { title: name, category: "Data" };
    }

    return { title: name, category: "General" };
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
    <div className="flex flex-col gap-6">
      {/* Filtering Header controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-4">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-2">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  isActive
                    ? "bg-text-primary text-white shadow-sm"
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

      {/* Modules Listing Grid (Premium Cards) */}
      {filteredModules.length > 0 ? (
        <div className="grid grid-cols-1 gap-5">
          {filteredModules.map((m) => {
            const { title, category } = parseModuleMetadata(m.name);
            const statusInfo = getModuleStatusInfo(m);
            const isBlocked = m.status === "blocked";
            const hasBlockerMsg = m.blocker_description && m.blocker_description.trim().length > 0;

            return (
              <div
                key={m.id}
                className={`bg-surface border rounded-2xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col gap-4 relative group ${
                  isBlocked ? "border-error ring-1 ring-error/20" : "border-border"
                }`}
              >
                {/* Top: Name, Category, Status Badge */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      href={`/projects/${projectId}/modules/${m.id}`}
                      className="text-base font-bold text-text-primary hover:text-accent transition-colors flex items-center gap-1.5"
                    >
                      {title}
                    </Link>
                    {category && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-surface-secondary text-text-secondary border border-border">
                        {category}
                      </span>
                    )}
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${statusInfo.className}`}>
                    {statusInfo.label}
                  </span>
                </div>

                {/* Description */}
                {m.description && (
                  <p className="text-xs text-text-secondary leading-relaxed -mt-1 max-w-3xl">
                    {m.description}
                  </p>
                )}

                {/* Grid Metadata */}
                <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-4 pt-2 text-xs border-t border-border/50">
                  {/* Ownership */}
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] uppercase font-bold text-text-muted tracking-wider">
                      Ownership
                    </span>
                    {m.assigned_name ? (
                      <div className="flex items-center gap-2 mt-0.5">
                        <div className="h-6 w-6 rounded-full bg-accent-muted text-accent font-bold text-[10px] flex items-center justify-center border border-accent-light uppercase">
                          {m.assigned_name.slice(0, 2)}
                        </div>
                        <span className="font-semibold text-text-primary">
                          {m.assigned_name}
                        </span>
                      </div>
                    ) : (
                      <span className="text-text-muted italic mt-0.5">Unassigned</span>
                    )}
                  </div>

                  {/* Deadline */}
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] uppercase font-bold text-text-muted tracking-wider">
                      Deadline
                    </span>
                    <span className="font-semibold text-text-primary mt-1">
                      {getDeadlineText(m.deadline)}
                    </span>
                  </div>

                  {/* Progress */}
                  <div className="flex flex-col gap-1 w-full">
                    <div className="flex items-center justify-between font-semibold text-text-primary">
                      <span className="text-[10px] uppercase font-bold text-text-muted tracking-wider">
                        Progress
                      </span>
                      <span>{m.progress}%</span>
                    </div>
                    <div className="w-full bg-border h-1.5 rounded-full overflow-hidden mt-1.5">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${statusInfo.barColor}`}
                        style={{ width: `${m.progress}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* Warning Blocker Message Banner */}
                {hasBlockerMsg && (
                  <div
                    className={`mt-2 rounded-xl px-4 py-2.5 text-xs font-semibold border ${
                      isBlocked
                        ? "bg-error-light text-error-foreground border-error-light"
                        : "bg-warning-light text-warning-foreground border-warning-light"
                    }`}
                  >
                    Blocked by: {m.blocker_description}
                  </div>
                )}

                {/* Absolute Link Arrow */}
                <Link
                  href={`/projects/${projectId}/modules/${m.id}`}
                  className="absolute right-4 bottom-4 text-text-muted group-hover:text-accent transition-colors opacity-0 group-hover:opacity-100"
                >
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            );
          })}
        </div>
      ) : (
        /* Empty State */
        <div className="border border-border border-dashed rounded-2xl p-12 flex flex-col items-center justify-center text-center bg-surface gap-4">
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
