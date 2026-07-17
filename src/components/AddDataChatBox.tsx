"use client";

import { useState } from "react";

/**
 * Chat-box style input for adding one more supporting data point in your own
 * words. Mirrors the look of the conversational inputs elsewhere in the flow.
 */
export default function AddDataChatBox({
  onAdd,
  placeholder = "Add another data point in your own words...",
}: {
  onAdd: (text: string) => void;
  placeholder?: string;
}) {
  const [draft, setDraft] = useState("");

  const submit = () => {
    const v = draft.trim();
    if (!v) return;
    onAdd(v);
    setDraft("");
  };

  return (
    <div className="flex gap-2.5">
      <input
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && submit()}
        placeholder={placeholder}
        aria-label="Add a data point"
        className="w-full rounded-xl border border-border-strong bg-white px-4 py-3 text-sm text-ink outline-none focus:border-accent"
      />
      <button
        onClick={submit}
        className="inline-flex items-center gap-2 rounded-xl bg-accent-ink px-5 py-3 text-sm font-semibold whitespace-nowrap text-white shadow-cta transition duration-150 enabled:hover:bg-accent-ink-2 enabled:active:translate-y-px"
      >
        Add
      </button>
    </div>
  );
}
