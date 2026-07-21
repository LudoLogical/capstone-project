"use client";

import { DATA_DETAILS, SHARE_KEYS, dataActionLabel } from "@/data/seed";
import type { NSRService } from "@/types/data";
import CheckboxRow from "@/components/primitives/CheckboxRow";
import DataUploadField from "@/components/analysis/DataUploadField";
import { ArrowRight, ExternalLink } from "lucide-react";

/**
 * Step 1 of both the data collection wizard and the report flow: choose which
 * Vibrancy Portal sources to share, and add your own.
 *
 * Takes `share` and `uploads` structurally rather than a
 * `WizardState | ReportState` union - both states expose the same two shapes,
 * and staying structural keeps this component free of any store coupling.
 */
export default function ContextStep({
  share,
  uploads,
  toggleShare,
  setUsageKey,
  addUploads,
  removeUpload,
  onContinue,
}: {
  share: Record<NSRService, boolean>;
  uploads: string[];
  toggleShare: (key: NSRService) => void;
  setUsageKey: (key: NSRService) => void;
  addUploads: (names: string[]) => void;
  removeUpload: (index: number) => void;
  // Advancing differs by flow: the wizard only records the step as visited,
  // while the report also marks this step complete. Each page supplies its own.
  onContinue: () => void;
}) {
  return (
    <div>
      <h1 className="mb-2 font-serif text-xl leading-tight font-bold">
        Share your context
      </h1>
      <p className="mb-5 max-w-2xl text-sm leading-relaxed text-ink-muted">
        This tool uses AI to help you gather and understand your data. Sharing
        your context allows the AI to customize its guidance to your specific
        situation. None of your info will ever be used to train or improve the
        AI.
      </p>

      <div className="mb-2.5 text-xs font-bold tracking-wider text-ink-muted uppercase">
        From the Vibrancy Portal
      </div>
      <div className="mb-5 flex flex-col gap-3.5 rounded-2xl border border-border bg-surface p-6">
        {SHARE_KEYS.map((key) => {
          const d = DATA_DETAILS[key];
          const completed = d.completed;
          return (
            <div
              key={key}
              className="flex flex-wrap items-center justify-between gap-3"
            >
              <CheckboxRow
                checked={share[key]}
                onToggle={() => toggleShare(key)}
                label={d.label}
                hint={completed ? "Completed" : d.meta}
              />
              <div className="flex flex-none gap-2">
                <button
                  onClick={() => setUsageKey(key)}
                  className="inline-flex items-center gap-2 rounded-lg border border-border-strong bg-white px-4 py-2.5 text-sm font-semibold whitespace-nowrap text-ink transition duration-150 hover:border-accent"
                >
                  How is this used?
                </button>
                <button
                  // Intentionally inert: the deployment integration wires
                  // this to the matching Vibrancy Portal flow.
                  onClick={() => {}}
                  className="inline-flex items-center gap-2 rounded-lg border border-border-strong bg-white px-4 py-2.5 text-sm font-semibold whitespace-nowrap text-ink transition duration-150 enabled:hover:border-accent disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {dataActionLabel(key, completed)}{" "}
                  <ExternalLink size={14} className="shrink-0" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mb-2.5 text-xs font-bold tracking-wider text-ink-muted uppercase">
        From Your Organization
      </div>
      <div className="mb-6 rounded-2xl border border-border bg-surface p-6">
        <p className="mb-3 max-w-2xl text-sm leading-relaxed text-ink-muted">
          There are many different kinds of data that can be helpful here.
          Examples include attendance sheets, surveys, past reports, participant
          counts, and letters of support.
        </p>
        <DataUploadField
          uploads={uploads}
          onAddFiles={addUploads}
          onAddLink={(link) => addUploads([link])}
          onRemove={removeUpload}
        />
      </div>

      <div className="flex items-center justify-between gap-2.5">
        <div />
        <button
          onClick={onContinue}
          className="inline-flex items-center gap-2 rounded-xl bg-accent-ink px-5 py-3 text-sm font-semibold whitespace-nowrap text-white shadow-cta transition duration-150 enabled:hover:bg-accent-ink-2 enabled:active:translate-y-px disabled:cursor-not-allowed disabled:opacity-50"
        >
          Save and continue <ArrowRight size={16} className="shrink-0" />
        </button>
      </div>
    </div>
  );
}
