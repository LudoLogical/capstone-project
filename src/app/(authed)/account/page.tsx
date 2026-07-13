"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  ACCOUNT_ORG_NAME,
  ACCOUNT_READINESS,
  ACCOUNT_LOWEST_SECTION,
  ACCOUNT_LOWEST_HINT,
} from "@/data/seed";
import { useAppStore } from "@/store/useAppStore";
import { useAccountSectionsView } from "@/store/derived";

function pctPillClass(pct: number): string {
  if (pct >= 90) return "bg-success-bg text-success-ink";
  if (pct >= 75) return "bg-warning-bg text-warning-ink";
  return "bg-accent-tint text-accent-ink";
}

function segmentClass(pct: number): string {
  if (pct >= 90) return "bg-success-ink-2";
  if (pct >= 75) return "bg-readiness-warn";
  return "bg-accent-ink";
}

export default function AccountProfilePage() {
  const router = useRouter();
  const sections = useAccountSectionsView();
  const accountExpanded = useAppStore((s) => s.accountExpanded);
  const toggleAccountSection = useAppStore((s) => s.toggleAccountSection);
  const setAccountEdit = useAppStore((s) => s.setAccountEdit);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");

  const startEdit = (factId: string, body: string) => {
    setEditingId(factId);
    setDraft(body);
  };

  const save = (factId: string) => {
    setAccountEdit(factId, draft);
    setEditingId(null);
  };

  return (
    <div className="animate-nc-rise mx-auto max-w-4xl px-8 pt-7 pb-20">
      <button
        onClick={() => router.push("/dashboard")}
        className="mb-4 inline-block text-sm font-semibold text-ink-muted hover:text-ink"
      >
        ← Back to dashboard
      </button>
      <h1 className="mb-2.5 font-serif text-3xl leading-tight font-medium">
        {ACCOUNT_ORG_NAME}
      </h1>
      <p className="mb-7 max-w-3xl text-sm leading-relaxed text-ink-muted">
        Your facts, grouped by the questions every funder asks — not by what kind
        of record they are. This is what gets pulled into Write and Report.
      </p>

      <div className="mb-5 rounded-2xl border border-border bg-surface p-6">
        <div className="mb-4 flex flex-wrap items-center gap-5">
          <div
            style={{
              background: `conic-gradient(var(--color-accent) ${ACCOUNT_READINESS * 3.6}deg, var(--color-divider-2) 0deg)`,
            }}
            className="flex h-20 w-20 flex-none items-center justify-center rounded-full"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-xl font-bold">
              {ACCOUNT_READINESS}%
            </div>
          </div>
          <div className="min-w-56 flex-1">
            <div className="mb-1.5 text-base font-bold">
              Grant-ready across 5 categories
            </div>
            <div className="text-sm leading-normal text-ink-muted">
              Lowest section: &apos;{ACCOUNT_LOWEST_SECTION}&apos; —{" "}
              {ACCOUNT_LOWEST_HINT}.
            </div>
          </div>
        </div>
        <div className="flex h-2 gap-1 overflow-hidden rounded-full">
          {sections.map((sec) => (
            <div
              key={sec.id}
              className={`flex-1 rounded-full ${segmentClass(sec.pct)}`}
            />
          ))}
        </div>
      </div>

      {sections.map((sec) => (
        <div
          key={sec.id}
          className="mb-3 overflow-hidden rounded-2xl border border-border bg-surface p-0"
        >
          <button
            onClick={() => toggleAccountSection(sec.id)}
            className="flex w-full cursor-pointer items-center gap-3.5 bg-white px-5 py-4 text-left"
          >
            <div className="flex h-10 w-10 flex-none items-center justify-center rounded-lg bg-info-bg text-lg">
              {sec.icon}
            </div>
            <div className="min-w-0 flex-1">
              <div className="mb-0.5 text-base font-bold">{sec.title}</div>
              <div className="text-sm text-ink-muted">{sec.subtitle}</div>
            </div>
            <div className="text-sm whitespace-nowrap text-ink-muted">
              {sec.facts.length} facts
            </div>
            <div
              className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold ${pctPillClass(sec.pct)}`}
            >
              {sec.pct}%
            </div>
            <div className="w-4 text-center text-sm text-ink-muted">
              {accountExpanded[sec.id] ? "▲" : "▼"}
            </div>
          </button>

          {accountExpanded[sec.id] && (
            <div className="border-t border-divider px-5 pb-5">
              <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {sec.factsResolved.map((fact) =>
                  editingId === fact.id ? (
                    <div
                      key={fact.id}
                      className="rounded-xl border-2 border-info-ink bg-white p-4"
                    >
                      <div className="mb-2.5 text-sm font-bold">
                        {fact.title}
                      </div>
                      <textarea
                        value={draft}
                        onChange={(e) => setDraft(e.target.value)}
                        aria-label="Edit fact text"
                        className="mb-3 min-h-24 w-full resize-y rounded-xl border border-border-strong bg-white px-4 py-3 text-sm leading-normal text-ink outline-none"
                      />
                      <div className="flex gap-2.5">
                        <button
                          onClick={() => save(fact.id)}
                          className="inline-flex items-center gap-2 rounded-lg bg-info-ink px-4 py-2.5 text-sm font-semibold whitespace-nowrap text-white transition duration-150 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="inline-flex items-center gap-2 rounded-lg border border-border-strong bg-white px-4 py-2.5 text-sm font-semibold whitespace-nowrap text-ink transition duration-150 enabled:hover:border-accent disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div
                      key={fact.id}
                      className="relative rounded-xl border border-border-soft bg-surface-alt-2 p-4"
                    >
                      <button
                        onClick={() => startEdit(fact.id, fact.body)}
                        aria-label="Edit fact"
                        className="absolute top-3 right-3 h-7 w-7 cursor-pointer rounded-lg bg-divider text-ink-muted"
                      >
                        ✎
                      </button>
                      <div className="mb-2.5 flex items-center gap-2 pr-9">
                        <span className="text-base">{fact.icon}</span>
                        <div className="text-sm font-bold">{fact.title}</div>
                      </div>
                      <p className="mb-3.5 text-sm leading-relaxed text-ink-body">
                        {fact.body}
                      </p>
                      <div className="flex flex-wrap justify-between gap-2">
                        <div className="flex flex-wrap gap-1.5">
                          {fact.tags.map((tag) => (
                            <span
                              key={tag}
                              className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold ${
                                tag === "Write"
                                  ? "bg-accent-tint-2 text-accent-ink-2"
                                  : "bg-info-bg text-info-ink"
                              }`}
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                        <span className="text-xs text-ink-faint">
                          Updated {fact.updated}
                        </span>
                      </div>
                    </div>
                  ),
                )}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
