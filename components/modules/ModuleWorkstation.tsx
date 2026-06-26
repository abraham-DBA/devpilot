"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BlockerModal } from "./BlockerModal";
import { updateModuleProgressAndStatus, updateModuleNotes } from "@/actions/modules";
import { toast } from "sonner";
import { 
  ChevronLeft, 
  Calendar, 
  User, 
  Code, 
  FileText, 
  Check, 
  Loader2, 
  AlertCircle, 
  CheckCircle2, 
  Bookmark,
  Eye,
  Edit2
} from "lucide-react";
import { formatDate } from "@/lib/utils";

type Project = {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
};

type Module = {
  id: string;
  project_id: string;
  name: string;
  description: string | null;
  assigned_to: string | null;
  assigned_name: string | null;
  progress: number;
  status: "not_started" | "in_progress" | "review" | "completed" | "blocked";
  deadline: string;
  blocker_description: string | null;
  technical_notes: string | null;
  implementation_notes: string | null;
};

type Profile = {
  id: string;
  name: string;
  email: string;
  role: string;
};

type Props = {
  project: Project;
  module: Module;
  profile: Profile;
};

// A helper function to render simple markdown formatting
function SimpleMarkdown({ text }: { text: string }) {
  if (!text) return <p className="text-xs text-text-muted italic">No documentation written yet.</p>;

  return (
    <div className="whitespace-pre-wrap font-sans text-sm text-text-primary leading-relaxed break-words flex flex-col gap-3">
      {text.split("\n\n").map((para, i) => {
        // Handle code blocks (wrapped in ```)
        if (para.startsWith("```") && para.endsWith("```")) {
          const lines = para.split("\n").filter((line) => !line.startsWith("```"));
          return (
            <pre key={i} className="bg-surface-secondary border border-border rounded-lg p-4 font-mono text-xs text-text-primary overflow-x-auto my-2">
              <code>{lines.join("\n")}</code>
            </pre>
          );
        }

        // Handle list items
        if (para.startsWith("- ") || para.startsWith("* ")) {
          return (
            <ul key={i} className="list-disc pl-5 flex flex-col gap-1 my-1">
              {para.split("\n").map((item, j) => (
                <li key={j}>{item.replace(/^[-*]\s+/, "")}</li>
              ))}
            </ul>
          );
        }

        // Handle headers (starting with #)
        if (para.startsWith("#")) {
          const depth = (para.match(/^#+/) || [""])[0].length;
          const content = para.replace(/^#+\s+/, "");
          const textClass = 
            depth === 1 ? "text-lg font-bold" :
            depth === 2 ? "text-base font-bold" :
            "text-sm font-bold";
          return <h4 key={i} className={`${textClass} text-text-primary mt-2`}>{content}</h4>;
        }

        return <p key={i}>{para}</p>;
      })}
    </div>
  );
}

export function ModuleWorkstation({ project, module, profile }: Props) {
  const router = useRouter();
  
  // Workstation controls state
  const [status, setStatus] = useState<Module["status"]>(module.status);
  const [progress, setProgress] = useState(module.progress);
  const [blockerDesc, setBlockerDesc] = useState<string>(module.blocker_description || "");
  const [isBlockerOpen, setIsBlockerOpen] = useState(false);
  const [isSavingControls, setIsSavingControls] = useState(false);

  // Documentation tabs state
  const [activeTab, setActiveTab] = useState<"technical" | "implementation">("technical");
  const [isEditMode, setIsEditMode] = useState(false);
  const [techNotes, setTechNotes] = useState(module.technical_notes || "");
  const [implNotes, setImplNotes] = useState(module.implementation_notes || "");
  const [isSavingNotes, setIsSavingNotes] = useState(false);

  const isAssigned = module.assigned_to === profile.id;
  const isManager = profile.role === "team_lead" || profile.role === "project_manager";
  const canEdit = isAssigned || isManager;

  // Handle status selections
  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value as Module["status"];
    if (val === "blocked") {
      setIsBlockerOpen(true);
    } else {
      setStatus(val);
      if (val === "completed") {
        setProgress(100);
      } else if (val === "not_started") {
        setProgress(0);
      }
    }
  };

  const handleBlockerSubmit = (reason: string) => {
    setBlockerDesc(reason);
    setStatus("blocked");
    setIsBlockerOpen(false);
  };

  const handleBlockerCancel = () => {
    setIsBlockerOpen(false);
    // Reset dropdown selection
    setStatus(module.status);
  };

  // Submit Progress & Status
  const handleSaveControls = async () => {
    if (!canEdit) return;
    setIsSavingControls(true);

    try {
      const result = await updateModuleProgressAndStatus({
        projectId: project.id,
        moduleId: module.id,
        progress,
        status,
        blockerDescription: status === "blocked" ? blockerDesc : undefined,
      });

      if (!result.success) {
        toast.error(result.error || "Failed to update workstation data.");
      } else {
        toast.success("Module status updated successfully!");
        router.refresh();
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred during submission.");
    } finally {
      setIsSavingControls(false);
    }
  };

  // Submit Documentation Notes
  const handleSaveNotes = async () => {
    if (!canEdit) return;
    setIsSavingNotes(true);

    try {
      const result = await updateModuleNotes({
        projectId: project.id,
        moduleId: module.id,
        technicalNotes: activeTab === "technical" ? techNotes : undefined,
        implementationNotes: activeTab === "implementation" ? implNotes : undefined,
      });

      if (!result.success) {
        toast.error(result.error || "Failed to save scope documentation.");
      } else {
        toast.success(`${activeTab === "technical" ? "Technical" : "Implementation"} notes saved!`);
        setIsEditMode(false);
        router.refresh();
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred while saving notes.");
    } finally {
      setIsSavingNotes(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Blocker Modal Popup */}
      <BlockerModal
        isOpen={isBlockerOpen}
        onClose={handleBlockerCancel}
        onSubmit={handleBlockerSubmit}
      />

      {/* Back link */}
      <div>
        <Link
          href={`/projects/${project.id}`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-text-secondary hover:text-accent transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Project details
        </Link>
      </div>

      {/* Blocker warning banner */}
      {module.status === "blocked" && (
        <div className="bg-error-light border border-error-light text-error-foreground rounded-2xl p-5 flex items-start gap-3.5 shadow-sm">
          <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-bold uppercase tracking-wider">Critical Blocker Logged</span>
            <p className="text-xs leading-relaxed font-semibold">
              {module.blocker_description || "No blocker details provided."}
            </p>
          </div>
        </div>
      )}

      {/* Grid workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left pane: notes documentation */}
        <div className="lg:col-span-2 bg-surface border border-border rounded-2xl p-6 shadow-sm flex flex-col gap-5">
          <div className="flex items-center justify-between border-b border-border pb-3">
            {/* Tabs */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => {
                  setActiveTab("technical");
                  setIsEditMode(false);
                }}
                className={`text-xs font-bold uppercase tracking-wider pb-3 border-b-2 -mb-[13px] transition-all cursor-pointer ${
                  activeTab === "technical"
                    ? "border-accent text-accent"
                    : "border-transparent text-text-secondary hover:text-text-primary"
                }`}
              >
                Technical Notes
              </button>
              <button
                onClick={() => {
                  setActiveTab("implementation");
                  setIsEditMode(false);
                }}
                className={`text-xs font-bold uppercase tracking-wider pb-3 border-b-2 -mb-[13px] transition-all cursor-pointer ${
                  activeTab === "implementation"
                    ? "border-accent text-accent"
                    : "border-transparent text-text-secondary hover:text-text-primary"
                }`}
              >
                Implementation Notes
              </button>
            </div>

            {/* Edit / Preview toggles */}
            {canEdit && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditMode(false)}
                  className={`inline-flex h-8 items-center gap-1.5 px-3 rounded-lg text-xs font-semibold border border-border cursor-pointer transition-all ${
                    !isEditMode
                      ? "bg-accent-muted text-accent border-accent-light"
                      : "bg-surface text-text-secondary hover:text-text-primary hover:bg-surface-secondary"
                  }`}
                >
                  <Eye className="h-3.5 w-3.5" />
                  Preview
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditMode(true)}
                  className={`inline-flex h-8 items-center gap-1.5 px-3 rounded-lg text-xs font-semibold border border-border cursor-pointer transition-all ${
                    isEditMode
                      ? "bg-accent-muted text-accent border-accent-light"
                      : "bg-surface text-text-secondary hover:text-text-primary hover:bg-surface-secondary"
                  }`}
                >
                  <Edit2 className="h-3.5 w-3.5" />
                  Edit
                </button>
              </div>
            )}
          </div>

          {/* Notes display */}
          <div className="min-h-[250px]">
            {isEditMode ? (
              <div className="flex flex-col gap-4">
                <textarea
                  rows={12}
                  className="w-full bg-surface border border-border rounded-lg p-4 font-mono text-sm text-text-primary placeholder:text-text-muted focus:ring-2 focus:ring-accent focus:border-transparent outline-none transition-all"
                  placeholder={
                    activeTab === "technical"
                      ? "Document SQL queries, databases, variables, or schema updates. Supports simple markdown headings (#), bullets (-), and code blocks (```)."
                      : "Document workarounds, build commands, setup instructions, or third-party logic caveats."
                  }
                  value={activeTab === "technical" ? techNotes : implNotes}
                  onChange={(e) => {
                    if (activeTab === "technical") {
                      setTechNotes(e.target.value);
                    } else {
                      setImplNotes(e.target.value);
                    }
                  }}
                />
                
                <div className="flex items-center justify-end">
                  <button
                    onClick={handleSaveNotes}
                    disabled={isSavingNotes}
                    className="inline-flex h-9 items-center justify-center gap-2 px-4 rounded-lg bg-accent text-accent-foreground text-xs font-semibold hover:bg-accent-dark disabled:opacity-50 transition-colors cursor-pointer"
                  >
                    {isSavingNotes ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <span>Save {activeTab === "technical" ? "Technical" : "Implementation"} Notes</span>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-2">
                <SimpleMarkdown 
                  text={activeTab === "technical" ? techNotes : implNotes} 
                />
              </div>
            )}
          </div>
        </div>

        {/* Right pane: controls workstation */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          {/* Progress Control Panel */}
          <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm flex flex-col gap-5">
            <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider border-b border-border pb-2.5">
              Workstation Controls
            </h3>

            {/* Assigned details */}
            <div className="flex items-center gap-3 p-1">
              <div className="h-9 w-9 rounded-full bg-accent-muted text-accent font-bold text-sm flex items-center justify-center border border-accent-light uppercase">
                {module.assigned_name ? module.assigned_name.slice(0, 2) : "UN"}
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-text-primary leading-tight">
                  {module.assigned_name || "Unassigned Module"}
                </span>
                <span className="text-[10px] text-text-secondary mt-0.5 leading-none">
                  Owner
                </span>
              </div>
            </div>

            {/* Deadline */}
            <div className="flex items-center gap-2 text-xs text-text-secondary bg-surface-secondary border border-border rounded-xl p-3">
              <Calendar className="h-4 w-4 text-text-muted shrink-0" />
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider leading-none">Deadline</span>
                <span className="text-text-primary font-semibold mt-0.5">{formatDate(module.deadline)}</span>
              </div>
            </div>

            {/* Divider */}
            <div className="h-px bg-border w-full my-1"></div>

            {/* Form actions panel */}
            <div className="flex flex-col gap-5">
              {/* Status Selector */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">
                  Select Status
                </label>
                <div className="relative flex items-center">
                  <Bookmark className="absolute left-3 h-4 w-4 text-text-muted" />
                  <select
                    disabled={!canEdit || isSavingControls}
                    className="w-full bg-surface border border-border rounded-lg pl-10 pr-3 py-2 text-xs text-text-primary font-medium focus:ring-2 focus:ring-accent focus:border-transparent outline-none transition-all appearance-none cursor-pointer"
                    value={status}
                    onChange={handleStatusChange}
                  >
                    <option value="not_started">Not Started</option>
                    <option value="in_progress">In Progress</option>
                    <option value="review">Review / QA</option>
                    <option value="completed">Completed</option>
                    <option value="blocked">Blocked</option>
                  </select>
                </div>
              </div>

              {/* Progress Slider */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-[10px] text-text-secondary uppercase tracking-wider">
                    Progress Value
                  </span>
                  <span className="text-text-primary font-extrabold">{progress}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  disabled={!canEdit || status === "completed" || isSavingControls}
                  className="w-full h-1.5 bg-border rounded-lg appearance-none cursor-pointer accent-accent disabled:opacity-50"
                  value={progress}
                  onChange={(e) => setProgress(Number(e.target.value))}
                />
              </div>

              {/* Save Controls Button */}
              {canEdit ? (
                <div className="flex flex-col gap-2 mt-1">
                  <button
                    type="button"
                    onClick={handleSaveControls}
                    disabled={isSavingControls}
                    className="w-full h-10 inline-flex items-center justify-center gap-2 rounded-lg bg-accent text-accent-foreground text-xs font-semibold hover:bg-accent-dark disabled:opacity-50 transition-all shadow-sm cursor-pointer"
                  >
                    {isSavingControls ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <span>Save Workstation State</span>
                    )}
                  </button>
                </div>
              ) : (
                <p className="text-[11px] text-text-muted italic text-center mt-2">
                  You are not authorized to update progress controls for this module.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
