"use client";

import { useAppStore } from "@/store/useAppStore";
import { ISSUE_TAGS, LOCATION_OPTIONS } from "@/data/selectors";
import {
  Search,
  BarChart3,
  Users,
  Check,
  ArrowLeft,
  ArrowRight,
  type LucideIcon,
} from "lucide-react";

const FEATURES: { icon: LucideIcon; title: string; body: string }[] = [
  {
    icon: Search,
    title: "Find Matching Grants",
    body: "Describe your work in plain language and let AI rank grants by how well they fit - no more scrolling directories sorted by deadline.",
  },
  {
    icon: BarChart3,
    title: "Storytell Your Impact",
    body: "Turn the numbers you already have into grant-ready framing, every figure traceable to its source. Reporting becomes gathering, not scrambling.",
  },
  {
    icon: Users,
    title: "Find Grant Collaborators",
    body: "See other New Sun Rising organizations open to teaming up - then ask NSR for a warm introduction. You always decide who to reach.",
  },
];

const STEP_COUNT = 3;

function chip(active: boolean) {
  return `rounded-full border px-3.5 py-2 text-sm font-semibold transition duration-150 ${
    active
      ? "border-accent bg-accent text-white"
      : "border-border-strong bg-white text-ink-secondary hover:border-accent"
  }`;
}

export default function Onboarding() {
  const step = useAppStore((s) => s.onboardStep);
  const org = useAppStore((s) => s.onboardOrg);
  const setStep = useAppStore((s) => s.setOnboardStep);
  const patchOrg = useAppStore((s) => s.patchOnboardOrg);
  const toggleIssue = useAppStore((s) => s.toggleOnboardIssue);
  const toggleArea = useAppStore((s) => s.toggleOnboardArea);
  const complete = useAppStore((s) => s.completeOnboarding);

  const matchCount = org.issues.length * 4 + org.areas.length * 3;
  const orgLabel = org.name.trim() || "your organization";
  const areaLabel = org.areas.length ? org.areas.join(", ") : "Pittsburgh, PA";

  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas px-6 py-10">
      <div className="animate-nc-rise w-full max-w-xl">
        {/* brand + step dots */}
        <div className="mb-5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-accent ring-4 ring-glow" />
            <div className="leading-none">
              <div className="text-sm font-bold">New Sun Rising</div>
              <div className="text-xs tracking-wide text-ink-muted">
                Vibrancy Portal
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            {Array.from({ length: STEP_COUNT }).map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === step
                    ? "w-6 bg-accent"
                    : i < step
                      ? "w-1.5 bg-accent-warm"
                      : "w-1.5 bg-border-strong"
                }`}
              />
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-border bg-surface p-8 shadow-soft">
          {/* ── Step 0: welcome + feature rundown ── */}
          {step === 0 && (
            <div>
              <h1 className="mb-2 font-serif text-3xl leading-tight font-bold">
                Everything you need to find and win grants, in one place
              </h1>
              <p className="mb-6 text-sm leading-relaxed text-ink-muted">
                The Vibrancy Portal helps your organization find the right
                grants, tell your impact story with the data you already have,
                and connect with organizations around you. Here&apos;s the quick
                rundown.
              </p>
              <div className="flex flex-col gap-3.5">
                {FEATURES.map((f) => (
                  <div key={f.title} className="flex items-start gap-3.5">
                    <div className="flex h-10 w-10 flex-none items-center justify-center rounded-xl bg-accent-tint text-lg">
                      <f.icon size={20} />
                    </div>
                    <div>
                      <div className="text-sm font-bold">{f.title}</div>
                      <p className="mt-0.5 text-sm leading-normal text-ink-muted">
                        {f.body}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Step 1: org details ── */}
          {step === 1 && (
            <div>
              <div className="mb-2.5 text-xs font-bold tracking-wider text-accent-ink-2 uppercase">
                About your work · 1 of 1
              </div>
              <h1 className="mb-2 font-serif text-3xl leading-tight font-bold">
                Tell us about your organization
              </h1>
              <p className="mb-6 text-sm leading-relaxed text-ink-muted">
                Just the basics - you can change any of this later. It&apos;s
                what lets us find grants that fit.
              </p>

              <label className="mb-2 block text-sm font-bold">Your name</label>
              <input
                value={org.person}
                onChange={(e) => patchOrg({ person: e.target.value })}
                placeholder="e.g. Maya Torres"
                className="mb-5 w-full rounded-xl border border-border-strong bg-white px-4 py-3 text-sm text-ink outline-none focus:border-accent"
              />

              <label className="mb-2 block text-sm font-bold">
                Organization name
              </label>
              <input
                value={org.name}
                onChange={(e) => patchOrg({ name: e.target.value })}
                placeholder="e.g. Hilltop Wellness Collective"
                className="mb-5 w-full rounded-xl border border-border-strong bg-white px-4 py-3 text-sm text-ink outline-none focus:border-accent"
              />

              <div className="mb-2 text-sm font-bold">
                What issues do you work on?{" "}
                <span className="font-medium text-ink-muted">
                  pick all that apply
                </span>
              </div>
              <div className="mb-5 flex flex-wrap gap-2">
                {ISSUE_TAGS.map((issue) => (
                  <button
                    key={issue}
                    type="button"
                    onClick={() => toggleIssue(issue)}
                    className={chip(org.issues.includes(issue))}
                  >
                    {issue}
                  </button>
                ))}
              </div>

              <div className="mb-2 text-sm font-bold">
                Where do you serve?{" "}
                <span className="font-medium text-ink-muted">
                  pick all that apply
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {LOCATION_OPTIONS.map((area) => (
                  <button
                    key={area}
                    type="button"
                    onClick={() => toggleArea(area)}
                    className={chip(org.areas.includes(area))}
                  >
                    {area}
                  </button>
                ))}
              </div>

              {matchCount > 0 && (
                <div className="mt-6 flex items-center gap-2.5 rounded-xl border border-warning-border bg-warning-bg px-4 py-3">
                  <BarChart3 size={16} className="flex-none text-warning-ink" />
                  <p className="text-sm leading-normal text-warning-ink">
                    <strong>{matchCount} grants</strong>{" "}
                    in the New Sun Rising network already look relevant -
                    we&apos;ll have them ready on
                    your dashboard.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* ── Step 2: done ── */}
          {step === 2 && (
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-success-bg text-2xl">
                <Check size={24} />
              </div>
              <h1 className="mb-2 font-serif text-3xl leading-tight font-bold">
                You&apos;re all set.
              </h1>
              <p className="mx-auto mb-6 max-w-md text-sm leading-relaxed text-ink-muted">
                Here&apos;s what we&apos;ve got ready for you. Everything stays
                editable in your profile.
              </p>
              <div className="mx-auto max-w-md rounded-2xl border border-border bg-surface-alt px-5 py-1 text-left">
                {[
                  `Profile started for ${orgLabel} · ${areaLabel}`,
                  matchCount > 0
                    ? `${matchCount} matching grants waiting in search`
                    : "Grant search ready to explore",
                  "Impact tracking ready to connect to your reports",
                ].map((line) => (
                  <div
                    key={line}
                    className="flex items-center gap-3 border-b border-border-soft py-3 last:border-b-0"
                  >
                    <Check size={14} className="flex-none text-success-ink-2" />
                    <span className="text-sm text-ink-secondary">{line}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* footer nav */}
          <div className="mt-8 flex items-center justify-between gap-4">
            {step === 0 ? (
              <button
                onClick={complete}
                className="text-sm font-semibold text-ink-muted hover:text-ink"
              >
                Skip setup
              </button>
            ) : (
              <button
                onClick={() => setStep(step - 1)}
                className="text-sm font-semibold text-ink-secondary hover:text-ink"
              >
                <ArrowLeft size={16} className="shrink-0" /> Back
              </button>
            )}

            {step < STEP_COUNT - 1 ? (
              <button
                onClick={() => setStep(step + 1)}
                className="inline-flex items-center gap-2 rounded-xl bg-accent-ink px-6 py-3 text-sm font-semibold whitespace-nowrap text-white shadow-cta transition duration-150 enabled:hover:bg-accent-ink-2 enabled:active:translate-y-px"
              >
                {step === 0 ? "Get started" : "Continue"}{" "}
                <ArrowRight size={16} className="shrink-0" />
              </button>
            ) : (
              <button
                onClick={complete}
                className="inline-flex items-center gap-2 rounded-xl bg-accent-ink px-6 py-3 text-sm font-semibold whitespace-nowrap text-white shadow-cta transition duration-150 enabled:hover:bg-accent-ink-2 enabled:active:translate-y-px"
              >
                Go to my dashboard{" "}
                <ArrowRight size={16} className="shrink-0" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
