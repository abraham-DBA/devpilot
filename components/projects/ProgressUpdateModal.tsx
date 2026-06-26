"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { toast } from "sonner";
import { updateModuleProgressAndStatus } from "@/actions/modules";

type Module = {
  id: string;
  name: string;
  progress: number;
  status: "not_started" | "in_progress" | "review" | "completed" | "blocked";
  blocker_description?: string | null;
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  modules: Module[];
};

export function ProgressUpdateModal({ isOpen, onClose, projectId, modules }: Props) {
  const [selectedModuleId, setSelectedModuleId] = useState("");
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<Module["status"]>("not_started");
  const [blockerDesc, setBlockerDesc] = useState("");
  const [loading, setLoading] = useState(false);

  // Reset/sync local state when selected module changes
  useEffect(() => {
    if (selectedModuleId) {
      const activeModule = modules.find((m) => m.id === selectedModuleId);
      if (activeModule) {
        setProgress(activeModule.progress);
        setStatus(activeModule.status);
        setBlockerDesc(activeModule.blocker_description || "");
      }
    } else if (modules.length > 0) {
      setSelectedModuleId(modules[0].id);
    }
  }, [selectedModuleId, modules]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedModuleId) {
      toast.error("Please select a module to update.");
      return;
    }

    if (status === "blocked" && !blockerDesc.trim()) {
      toast.error("A blocker description is required when status is Blocked.");
      return;
    }

    setLoading(true);

    try {
      const res = await updateModuleProgressAndStatus({
        projectId,
        moduleId: selectedModuleId,
        progress,
        status,
        blockerDescription: status === "blocked" ? blockerDesc : undefined,
      });

      if (res.success) {
        toast.success("Progress logged successfully!");
        onClose();
      } else {
        toast.error(res.error || "Failed to update module progress.");
      }
    } catch (err) {
      console.error(err);
      toast.error("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (newStatus: Module["status"]) => {
    setStatus(newStatus);
    if (newStatus === "completed") {
      setProgress(100);
    } else if (newStatus === "not_started") {
      setProgress(0);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-overlay/50 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="relative bg-surface border border-border rounded-2xl p-6 shadow-2xl max-w-md w-full flex flex-col gap-4 z-10 mx-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border pb-3">
          <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider text-xs">
            Log Progress Update
          </h3>
          <button
            onClick={onClose}
            className="h-7 w-7 text-text-secondary hover:text-text-primary hover:bg-surface-secondary rounded-lg flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">

            {/* Select Module */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="module-select" className="text-xs font-bold text-text-secondary uppercase">
                Select Module
              </label>
              <select
                id="module-select"
                className="w-full bg-surface border border-border rounded-lg p-2.5 text-xs text-text-primary focus:ring-2 focus:ring-accent focus:border-transparent outline-none transition-all"
                value={selectedModuleId}
                onChange={(e) => setSelectedModuleId(e.target.value)}
              >
                {modules.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.progress}%)
                  </option>
                ))}
              </select>
            </div>

            {/* Status Select */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="status-select" className="text-xs font-bold text-text-secondary uppercase">
                Status State
              </label>
              <select
                id="status-select"
                className="w-full bg-surface border border-border rounded-lg p-2.5 text-xs text-text-primary focus:ring-2 focus:ring-accent focus:border-transparent outline-none transition-all"
                value={status}
                onChange={(e) => handleStatusChange(e.target.value as Module["status"])}
              >
                <option value="not_started">Not Started</option>
                <option value="in_progress">In Progress</option>
                <option value="review">Review</option>
                <option value="completed">Completed</option>
                <option value="blocked">Blocked</option>
              </select>
            </div>

            {/* Progress Slider */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-xs font-bold text-text-secondary uppercase">
                <span>Progress Percentage</span>
                <span className="text-text-primary">{progress}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                className="w-full h-1.5 bg-border rounded-lg appearance-none cursor-pointer accent-accent"
                value={progress}
                disabled={status === "completed"}
                onChange={(e) => setProgress(Number(e.target.value))}
              />
            </div>

            {/* Blocker Description */}
            {status === "blocked" && (
              <div className="flex flex-col gap-1.5 animate-slide-down">
                <label htmlFor="blocker-desc" className="text-xs font-bold text-text-secondary uppercase">
                  Blocker Description <span className="text-error">*</span>
                </label>
                <textarea
                  id="blocker-desc"
                  rows={3}
                  className="w-full bg-surface border border-border rounded-lg p-3 text-xs text-text-primary placeholder:text-text-muted focus:ring-2 focus:ring-accent focus:border-transparent outline-none transition-all"
                  placeholder="Describe what is blocking this module..."
                  value={blockerDesc}
                  onChange={(e) => setBlockerDesc(e.target.value)}
                />
              </div>
            )}

            {/* Buttons */}
            <div className="flex items-center justify-end gap-3 border-t border-border pt-3 mt-1">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-surface hover:bg-surface-secondary text-text-primary border border-border rounded-lg text-xs font-semibold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-text-primary hover:bg-text-dark text-white rounded-lg text-xs font-semibold shadow-sm transition-colors cursor-pointer disabled:opacity-50"
              >
                {loading ? "Saving..." : "Save Changes"}
              </button>
            </div>
        </form>
      </div>
    </div>
  );
}
