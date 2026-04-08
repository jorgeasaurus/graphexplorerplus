"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import type { CloudEnvironment } from "~/lib/auth/msalConfig";

interface CloudEnvironmentDialogProps {
  open: boolean;
  onSelect: (environment: CloudEnvironment) => void;
  onCancel: () => void;
}

const CLOUD_OPTIONS: {
  id: CloudEnvironment;
  label: string;
  description: string;
  icon: React.ReactNode;
}[] = [
  {
    id: "global",
    label: "Global (Commercial)",
    description: "Microsoft 365 commercial cloud for worldwide customers",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="10" />
        <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      </svg>
    ),
  },
  {
    id: "usgov",
    label: "US Government (GCC High)",
    description: "Government Community Cloud High for US federal agencies",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
  },
  {
    id: "usgovdod",
    label: "US Government (DoD)",
    description: "Department of Defense cloud environment",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <path d="M12 8v4M12 16h.01" />
      </svg>
    ),
  },
  {
    id: "germany",
    label: "Germany",
    description: "Microsoft Cloud Germany (data residency in Germany)",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M3 21h18M5 21V7l8-4 8 4v14M9 21v-6h6v6" />
      </svg>
    ),
  },
  {
    id: "china",
    label: "China (21Vianet)",
    description: "Microsoft Azure operated by 21Vianet in China",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" />
      </svg>
    ),
  },
];

export function CloudEnvironmentDialog({ open, onSelect, onCancel }: CloudEnvironmentDialogProps) {
  const [selected, setSelected] = useState<CloudEnvironment>("global");

  const dialogRef = useRef<HTMLDivElement>(null);

  // Focus trap and Escape handling
  useEffect(() => {
    if (!open) return;

    const dialog = dialogRef.current;
    if (!dialog) return;

    const previouslyFocused = document.activeElement as HTMLElement;

    const focusableSelector = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
    const focusables = dialog.querySelectorAll<HTMLElement>(focusableSelector);
    const first = focusables[0];
    const last = focusables[focusables.length - 1];

    first?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onCancel();
        return;
      }
      if (e.key !== "Tab") return;
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last?.focus(); }
      } else {
        if (document.activeElement === last) { e.preventDefault(); first?.focus(); }
      }
    };

    dialog.addEventListener("keydown", handleKeyDown);
    return () => {
      dialog.removeEventListener("keydown", handleKeyDown);
      previouslyFocused?.focus();
    };
  }, [open, onCancel]);

  const handleContinue = useCallback(() => {
    onSelect(selected);
  }, [selected, onSelect]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onCancel}
        aria-hidden="true"
      />

      {/* Dialog */}
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="cloud-dialog-title"
        className="relative z-10 w-full max-w-md rounded-2xl border border-border-default bg-bg-elevated shadow-2xl"
      >
        {/* Header */}
        <div className="border-b border-border-subtle px-6 py-5">
          <h2 id="cloud-dialog-title" className="flex items-center gap-2.5 text-base font-semibold text-text-primary">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-accent" aria-hidden="true">
              <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" />
            </svg>
            Select Cloud Environment
          </h2>
          <p className="mt-1.5 text-xs text-text-muted">
            Choose the Microsoft cloud environment for your tenant. This determines which login endpoint and Graph API will be used.
          </p>
        </div>

        {/* Options */}
        <div className="px-4 py-4 space-y-2">
          {CLOUD_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              onClick={() => setSelected(opt.id)}
              className={`flex w-full items-start gap-3.5 rounded-xl border p-3.5 text-left transition-colors ${
                selected === opt.id
                  ? "border-accent bg-accent/5"
                  : "border-border-subtle hover:border-border-default hover:bg-bg-hover"
              }`}
            >
              {/* Radio indicator */}
              <span className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                selected === opt.id ? "border-accent" : "border-text-muted"
              }`}>
                {selected === opt.id && (
                  <span className="h-2 w-2 rounded-full bg-accent" />
                )}
              </span>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className={selected === opt.id ? "text-accent" : "text-text-muted"}>
                    {opt.icon}
                  </span>
                  <span className={`text-sm font-medium ${
                    selected === opt.id ? "text-text-primary" : "text-text-secondary"
                  }`}>
                    {opt.label}
                  </span>
                </div>
                <p className="mt-0.5 text-[11px] text-text-muted leading-relaxed">
                  {opt.description}
                </p>
              </div>
            </button>
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 border-t border-border-subtle px-6 py-4">
          <button
            onClick={onCancel}
            className="rounded-lg px-4 py-2 text-xs font-medium text-text-secondary transition-colors hover:bg-bg-hover hover:text-text-primary"
          >
            Cancel
          </button>
          <button
            onClick={handleContinue}
            className="flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-accent/90"
          >
            {/* Microsoft logo */}
            <svg width="14" height="14" viewBox="0 0 21 21" fill="none" aria-hidden="true">
              <rect x="1" y="1" width="9" height="9" fill="#f25022" />
              <rect x="1" y="11" width="9" height="9" fill="#00a4ef" />
              <rect x="11" y="1" width="9" height="9" fill="#7fba00" />
              <rect x="11" y="11" width="9" height="9" fill="#ffb900" />
            </svg>
            Continue to Sign In
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
