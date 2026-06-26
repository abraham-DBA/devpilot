"use client";

import { useState } from "react";
import { AlertCircle, X } from "lucide-react";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (reason: string) => void;
};

export function BlockerModal({ isOpen, onClose, onSubmit }: Props) {
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      setError("Please describe the blocker before saving.");
      return;
    }
    setError(null);
    onSubmit(reason.trim());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Dark overlay backdrop */}
      <div 
        className="absolute inset-0 bg-overlay/50 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      {/* Modal Card */}
      <div className="relative bg-surface border border-border rounded-2xl p-6 shadow-2xl max-w-md w-full flex flex-col gap-4 z-10 mx-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2 text-error">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider text-xs">
              Report Module Blocker
            </h3>
          </div>
          <button
            onClick={onClose}
            className="h-7 w-7 text-text-secondary hover:text-text-primary hover:bg-surface-secondary rounded-lg flex items-center justify-center transition-colors cursor-pointer"
            title="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-text-secondary" htmlFor="blocker-reason">
              BLOCKER DESCRIPTION / WHY IS THIS BLOCKED? <span className="text-error">*</span>
            </label>
            <p className="text-[10px] text-text-muted uppercase tracking-wider">
              Explain clearly what you are waiting for to resume progress.
            </p>
            <textarea
              id="blocker-reason"
              rows={4}
              required
              className="w-full bg-surface border border-border rounded-lg p-3 text-sm text-text-primary placeholder:text-text-muted focus:ring-2 focus:ring-accent focus:border-transparent outline-none transition-all mt-1"
              placeholder="e.g. Waiting for deployment credentials from DevOps, or backend schema update endpoint."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
            {error && (
              <span className="text-xs font-semibold text-error mt-1">{error}</span>
            )}
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-3 mt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-surface hover:bg-surface-secondary text-text-primary border border-border rounded-lg text-xs font-semibold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-error hover:bg-error-foreground text-accent-foreground rounded-lg text-xs font-semibold shadow-sm transition-colors cursor-pointer"
            >
              Confirm Blocker
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
