"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { STORIES, SESSION_USER } from "@/data/seed";
import { useAppStore } from "@/store/useAppStore";
import { useHydrated } from "@/store/useHydrated";
import {
  useDashboardGroups,
  type GrantView,
  type Progress,
} from "@/store/derived";
import { formatCurrency, formatDate } from "@/utils/format";
import Onboarding from "@/components/Onboarding";

type Tone = "accent" | "success" | "neutral";

const TONE: Record<
  Tone,
  { tile: string; bar: string; label: string }
> = {
  accent: {
    tile: "bg-accent-tint text-accent-ink",
    bar: "bg-accent",
    label: "text-accent-ink",
  },
  success: {
    tile: "bg-success-bg text-success-ink",
    bar: "bg-success-ink-2",
    label: "text-success-ink",
  },
  neutral: {
    tile: "bg-surface-alt text-ink-secondary",
    bar: "bg-border-strong",
    label: "text-ink-secondary",
  },
};

function pct(p: Progress): number {
  return p.total > 0 ? Math.round((p.done / p.total) * 100) : 0;
}

/** Small uppercase eyebrow used to label a dashboard section. */
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-3 text-xs font-bold tracking-wider text-ink-muted uppercase">
      {children}
    </div>
  );
}

/** One grant inside a board column: name, funder, due date, progress, actions. */
function GrantMiniCard({
  view,
  tone,
  dueLabel,
  progress,
  progressCaption,
  primary,
  secondary,
}: {
  view: GrantView;
  tone: Tone;
  dueLabel: string;
  progress?: Progress;
  progressCaption?: string;
  primary?: { label: string; to?: string; onClick?: () => void };
  secondary: { label: string; to?: string; onClick?: () => void };
}) {
  const router = useRouter();
  const t = TONE[tone];
  const go = (to?: string, onClick?: () => void) => () => {
    if (onClick) onClick();
    else if (to) router.push(to);
  };

  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <button
        onClick={() => router.push(`/grants/${view.grant.id}`)}
        className="mb-1 line-clamp-2 block text-left font-serif text-base leading-snug transition duration-150 hover:text-accent"
      >
        {view.grant.name}
      </button>
      <div className="mb-2.5 text-xs text-ink-muted">
        {view.grant.grantor} · {formatCurrency(view.grant.award.totalAmount)}
      </div>

      <div className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-surface-alt px-2.5 py-1 text-xs font-semibold text-ink-secondary">
        <span aria-hidden>🗓</span>
        {dueLabel}
      </div>

      {progress && (
        <div className="mb-3.5">
          <div className="mb-1 flex items-center justify-between text-xs">
            <span className="text-ink-muted">{progressCaption}</span>
            <span className={`font-bold ${t.label}`}>
              {progress.done}/{progress.total}
            </span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-alt">
            <div
              className={`h-full rounded-full ${t.bar}`}
              style={{ width: `${pct(progress)}%` }}
            />
          </div>
        </div>
      )}

      <div className="flex flex-col gap-2">
        {primary && (
          <button
            onClick={go(primary.to, primary.onClick)}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-accent px-3.5 py-2 text-xs font-semibold whitespace-nowrap text-white shadow-cta transition duration-150 enabled:hover:brightness-105"
          >
            {primary.label}
          </button>
        )}
        <button
          onClick={go(secondary.to, secondary.onClick)}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-border-strong bg-white px-3.5 py-2 text-xs font-semibold whitespace-nowrap text-ink transition duration-150 enabled:hover:border-accent"
        >
          {secondary.label}
        </button>
      </div>
    </div>
  );
}

/** A labeled board column with a colored header tile and its grant cards. */
function BoardColumn({
  icon,
  title,
  tone,
  count,
  empty,
  children,
}: {
  icon: string;
  title: string;
  tone: Tone;
  count: number;
  empty: string;
  children: React.ReactNode;
}) {
  const t = TONE[tone];
  return (
    <section className="flex flex-col rounded-2xl border border-border bg-surface-alt-2 p-5">
      <div className="mb-4 flex items-center gap-2.5 px-1">
        <div
          className={`flex h-8 w-8 flex-none items-center justify-center rounded-lg text-base ${t.tile}`}
        >
          {icon}
        </div>
        <div className="text-sm font-bold">{title}</div>
        <div className="ml-auto rounded-full bg-white px-2 py-0.5 text-xs font-bold text-ink-secondary">
          {count}
        </div>
      </div>
      <div className="flex flex-col gap-3">
        {count === 0 ? (
          <div className="rounded-xl border border-dashed border-border-strong px-4 py-6 text-center text-xs leading-normal text-ink-faint">
            {empty}
          </div>
        ) : (
          children
        )}
      </div>
    </section>
  );
}

export default function HomePage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const hydrated = useHydrated();
  const signedIn = useAppStore((s) => s.signedIn);
  const onboarded = useAppStore((s) => s.onboarded);
  const signIn = useAppStore((s) => s.signIn);
  const openCouplingModal = useAppStore((s) => s.openCouplingModal);
  const onboardOrg = useAppStore((s) => s.onboardOrg);
  const { inProgress, awarded, saved, collaborating } = useDashboardGroups();
  const setDraftFilters = useAppStore((s) => s.setDraftFilters);
  const applyFilters = useAppStore((s) => s.applyFilters);

  const goSearch = () => {
    signIn();
    setDraftFilters({ query });
    applyFilters();
    router.push("/search");
  };

  // Onboarding is the entry point: there's no separate landing page anymore.
  // Render nothing until hydrated so the onboarding doesn't flash in after a
  // blank/landing frame, then show onboarding until it's completed.
  if (!hydrated) return null;
  if (!onboarded) return <Onboarding />;

  const showPersonal = true;
  // Greet the user by the name they gave during onboarding, falling back to the
  // seed session user before they've provided one.
  const firstName =
    onboardOrg.person.trim().split(/\s+/)[0] || SESSION_USER.firstName;

  return (
    <div className="animate-nc-rise mx-auto w-full px-8 pt-8 pb-20">
      <div className="mb-6">
        <h1 className="font-serif text-3xl leading-tight font-medium">
          {showPersonal
            ? `Welcome to the Vibrancy Portal, ${firstName}.`
            : "Welcome to the Vibrancy Portal."}
        </h1>
        {showPersonal && onboardOrg.name.trim() && (
          <div className="mt-2 flex flex-wrap items-baseline gap-x-1.5">
            <span className="text-xl font-bold text-ink">
              {onboardOrg.name.trim()}
            </span>
            {onboardOrg.areas.length > 0 && (
              <span className="text-sm text-ink-muted">
                - Serving {onboardOrg.areas.join(", ")}
              </span>
            )}
          </div>
        )}
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-muted">
          This is your home base for grant work. Effectively discover grants
          that fit your work, find collaborators in the New Sun Rising network
          to apply for grants together, and tell powerful stories proving your
          impact with data.
        </p>
      </div>

      {/* ── Compact search: always visible ───────────────────── */}
      <section className="mb-8 rounded-2xl border border-border bg-surface p-5">
        <div className="flex flex-wrap items-center gap-3">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && goSearch()}
            aria-label="Search for grants by keyword"
            placeholder="Find a grant - e.g. health programs in Pittsburgh"
            className="w-full min-w-72 flex-1 rounded-xl border border-border-strong bg-white px-4 py-3 text-sm text-ink outline-none focus:border-accent"
          />
          <button
            onClick={goSearch}
            className="inline-flex items-center gap-2 rounded-xl bg-accent px-6 py-3 text-sm font-semibold whitespace-nowrap text-white shadow-cta transition duration-150 enabled:hover:brightness-105"
          >
            Search
          </button>
        </div>
      </section>

      {/* ── Personal grant board: signed-in only ─────────────── */}
      {showPersonal && (
        <div className="mb-10">
          <SectionLabel>Your grants at a glance</SectionLabel>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <BoardColumn
              icon="📝"
              title="Data for Grant Applications"
              tone="accent"
              count={inProgress.length}
              empty="No applications yet. Open a saved grant and start an application."
            >
              {inProgress.map((v) => (
                <GrantMiniCard
                  key={v.grant.id}
                  view={v}
                  tone="accent"
                  dueLabel={`Apply by ${formatDate(v.grant.timeline.applicationWindowEnd)}`}
                  progress={v.writingProgress}
                  progressCaption="Steps"
                  primary={{
                    label: "✦ Continue Writing",
                    to: `/grants/${v.grant.id}/collect`,
                  }}
                  secondary={{
                    label: "Grant Details",
                    to: `/grants/${v.grant.id}`,
                  }}
                />
              ))}
            </BoardColumn>

            <BoardColumn
              icon="🏆"
              title="Data for Grant Reports"
              tone="success"
              count={awarded.length}
              empty="No awarded grants yet. Reports appear here once you win funding."
            >
              {awarded.map((v) => (
                <GrantMiniCard
                  key={v.grant.id}
                  view={v}
                  tone="success"
                  dueLabel={`Report due ${formatDate(v.grant.timeline.firstReportDeadline)}`}
                  progress={v.reportProgress}
                  progressCaption="Report steps"
                  primary={{
                    label: "🔒 Continue Report",
                    to: `/grants/${v.grant.id}/report`,
                  }}
                  secondary={{
                    label: "Grant Details",
                    to: `/grants/${v.grant.id}`,
                  }}
                />
              ))}
            </BoardColumn>

            <BoardColumn
              icon="☆"
              title="Saved Grants"
              tone="neutral"
              count={saved.length}
              empty="No saved grants yet. Tap ☆ Save on any grant to keep it here."
            >
              {saved.map((v) => (
                <GrantMiniCard
                  key={v.grant.id}
                  view={v}
                  tone="neutral"
                  dueLabel={`Closes ${formatDate(v.grant.timeline.applicationWindowEnd)}`}
                  secondary={{
                    label: "Remove from Saved Grants",
                    onClick: () => openCouplingModal("unsave", v.grant.id),
                  }}
                />
              ))}
            </BoardColumn>

            <BoardColumn
              icon="🤝"
              title="Open to Collaborate"
              tone="accent"
              count={collaborating.length}
              empty="Not listed on any grants yet. Open a grant and list yourself as open to collaborate."
            >
              {collaborating.map((v) => (
                <GrantMiniCard
                  key={v.grant.id}
                  view={v}
                  tone="accent"
                  dueLabel={`Closes ${formatDate(v.grant.timeline.applicationWindowEnd)}`}
                  secondary={{
                    label: "Remove from Collaborate",
                    onClick: () => openCouplingModal("uncollab", v.grant.id),
                  }}
                />
              ))}
            </BoardColumn>
          </div>
        </div>
      )}

      {/* ── Signed-out prompt to reveal the personal board ────── */}
      {hydrated && !signedIn && (
        <section className="mb-10 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border bg-surface-alt p-6">
          <div className="min-w-60 flex-1">
            <div className="mb-1 text-base font-bold">
              Sign in to your portal
            </div>
            <p className="text-sm leading-normal text-ink-muted">
              See the applications you&apos;re writing, your awarded grant
              reports, and your saved grants - all in one place.
            </p>
          </div>
          <button
            onClick={() => signIn()}
            className="inline-flex items-center gap-2 rounded-xl bg-accent px-6 py-3.5 text-base font-semibold whitespace-nowrap text-white shadow-cta transition duration-150 enabled:hover:brightness-105"
          >
            Sign in to your portal →
          </button>
        </section>
      )}

      {/* ── Success stories: always visible ──────────────────── */}
      <section>
        <SectionLabel>Success stories from our leaders</SectionLabel>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {STORIES.map((st) => (
            <button
              key={st.id}
              onClick={() => router.push(`/stories/${st.id}`)}
              className="flex h-full cursor-pointer flex-col overflow-hidden rounded-2xl border border-border bg-surface-alt p-0 text-left transition duration-150 hover:border-accent hover:shadow-soft"
            >
              <div className="flex h-32 flex-none items-center justify-center bg-radial from-accent-warm to-accent to-80% text-5xl">
                <span aria-hidden>{st.emoji}</span>
              </div>
              <div className="flex flex-1 flex-col p-5">
                <div className="mb-3 inline-flex self-start items-center gap-1 rounded-full bg-accent-tint-2 px-3 py-1 text-xs font-bold text-accent-ink-2">
                  {st.tag}
                </div>
                <p className="mb-3 text-sm leading-normal">
                  <strong>{st.who}</strong> {st.what}
                </p>
                <div className="mt-auto text-sm font-bold text-accent">
                  Read their story →
                </div>
              </div>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
