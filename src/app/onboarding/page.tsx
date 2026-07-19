"use client";

import { useRouter } from "next/navigation";
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
    title: "Explore Matching Grants",
    body: "Sort grants by relevance and get help from AI to assess how well they align with your work. No more skimming through dozens of dead ends.",
  },
  {
    icon: BarChart3,
    title: "Prove Your Impact",
    body: "Supercharge your storytelling with local statistics and data you already have into your narratives and pitches. Put your best foot forward and get from applicant to awardee.",
  },
  {
    icon: Users,
    title: "Meet Potential Collaborators",
    body: "See other New Sun Rising organizations that are open to teaming up on the grants that interest you and secure warm introductions. You're always in control when and where you're visible.",
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

/**
 * First-run setup. Every route funnels an unonboarded user here (see
 * OnboardingGate), so this is the one page that renders without the app chrome.
 */
export default function OnboardingPage() {
  const router = useRouter();
  const step = useAppStore((s) => s.onboardStep);
  const org = useAppStore((s) => s.onboardOrg);
  const setStep = useAppStore((s) => s.setOnboardStep);
  const patchOrg = useAppStore((s) => s.patchOnboardOrg);
  const toggleIssue = useAppStore((s) => s.toggleOnboardIssue);
  const toggleArea = useAppStore((s) => s.toggleOnboardArea);
  const completeOnboarding = useAppStore((s) => s.completeOnboarding);

  // Finishing or skipping both land on the dashboard. `replace` keeps setup out
  // of the history stack, so Back can't walk the user into a flow they've done.
  const complete = () => {
    completeOnboarding();
    router.replace("/");
  };

  const matchCount = org.issues.length * 4 + org.areas.length * 3;
  const orgLabel = org.name.trim() || "your organization";

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
                Find and win the perfect grant.
              </h1>
              <p className="mb-6 text-sm leading-relaxed text-ink-muted">
                This tool helps your organization discover grants that align
                with your work, leverage data to enhance your applications and
                reports, and connect with organizations that share your goals.
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
                This info helps us recommend the best grants, data, and
                collaborators for your organization. You can change it at any
                time from your profile page.
              </p>

              <label className="mb-2 block text-sm font-bold">
                What&apos;s your name?
              </label>
              <input
                value={org.person}
                onChange={(e) => patchOrg({ person: e.target.value })}
                placeholder="e.g. Maya Torres"
                className="mb-5 w-full rounded-xl border border-border-strong bg-white px-4 py-3 text-sm text-ink outline-none focus:border-accent"
              />

              <label className="mb-2 block text-sm font-bold">
                What&apos;s the name of your organization?
              </label>
              <input
                value={org.name}
                onChange={(e) => patchOrg({ name: e.target.value })}
                placeholder="e.g. Hilltop Wellness Collective"
                className="mb-5 w-full rounded-xl border border-border-strong bg-white px-4 py-3 text-sm text-ink outline-none focus:border-accent"
              />

              <div className="mb-2 text-sm font-bold">
                What issues are relevant to your work?
                <span className="pl-1 font-medium text-ink-muted">
                  Select all that apply.
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
                What communities do you serve?
                <span className="pl-1 font-medium text-ink-muted">
                  Select all that apply.
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
                    <strong>{matchCount} grants </strong> in our database
                    already look relevant! They&apos;ll be waiting for you at
                    the top of your search results.
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
                Thanks for sharing a bit about {orgLabel}!
                <br />
                You can edit your responses at any time in your profile.
              </p>
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
                className="inline-flex items-center gap-2 rounded-xl px-2 text-sm font-semibold whitespace-nowrap text-ink-secondary transition duration-150 hover:text-ink"
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
                Go to my dashboard <ArrowRight size={16} className="shrink-0" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
