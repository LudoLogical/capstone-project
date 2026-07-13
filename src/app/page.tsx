"use client";

import { useRouter } from "next/navigation";
import { STORIES } from "@/data/seed";
import { useAppStore } from "@/store/useAppStore";

const ENTRY_CARDS = [
  {
    icon: "🔎",
    title: "Find your grant",
    body: "Search a trusted library, or let the AI rank grants by how well they fit your initiative.",
    cta: "Search grants →",
    to: "/search",
  },
  {
    icon: "📊",
    title: "Tell your data's story",
    body: "The AI turns neighborhood numbers into plain-language, grant-ready framing — every figure traceable to its source.",
    cta: "Go to my dashboard →",
    to: "/dashboard",
  },
  {
    icon: "🤝",
    title: "Connect with partners",
    body: "See suggested collaborators, then ask New Sun Rising for a warm introduction — no cold automated emails.",
    cta: "See how it works →",
    to: "/dashboard",
  },
];

export default function LandingPage() {
  const router = useRouter();
  const signIn = useAppStore((s) => s.signIn);

  const enterPortal = () => {
    signIn();
    router.push("/dashboard");
  };

  const enterTo = (to: string) => {
    signIn();
    router.push(to);
  };

  return (
    <div className="animate-nc-rise mx-auto max-w-5xl px-8 pt-10 pb-20">
      <section className="pt-20 pb-14 text-center">
        <div className="mb-7 inline-flex items-center gap-1 rounded-full border border-border bg-white px-3 py-1 text-xs font-bold text-accent-ink-2">
          For New Sun Rising client organizations
        </div>
        <h1 className="mx-auto mb-5 max-w-3xl font-serif text-6xl leading-none font-medium tracking-tight">
          Find grants. <span className="text-accent">Prove your impact</span>. Win
          funding.
        </h1>
        <p className="mx-auto mb-8 max-w-xl text-lg leading-relaxed text-ink-muted">
          Search for grants that fit your work, turn the data you already have
          into a case funders can act on, and keep drafts and reports in one
          place.
        </p>
        <button
          onClick={enterPortal}
          className="inline-flex items-center gap-2 rounded-xl bg-accent px-6 py-3.5 text-base font-semibold whitespace-nowrap text-white shadow-cta transition duration-150 enabled:hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Sign in to your portal →
        </button>
      </section>

      <section className="grid grid-cols-3 gap-4 pb-12">
        {ENTRY_CARDS.map((c) => (
          <button
            key={c.title}
            onClick={() => enterTo(c.to)}
            className="cursor-pointer rounded-2xl border border-border bg-surface p-6 text-left transition duration-150 hover:border-accent hover:shadow-soft"
          >
            <div className="mb-3 text-2xl">{c.icon}</div>
            <div className="mb-2 text-base font-bold">{c.title}</div>
            <p className="mb-3 text-sm leading-normal text-ink-muted">
              {c.body}
            </p>
            <div className="text-sm font-bold text-accent">{c.cta}</div>
          </button>
        ))}
      </section>

      <section className="pb-20">
        <div className="mb-4 text-xs font-bold tracking-wider text-ink-muted uppercase">
          Success stories from our leaders
        </div>
        <div className="grid grid-cols-3 gap-4">
          {STORIES.map((st) => (
            <button
              key={st.id}
              onClick={() => router.push(`/stories/${st.id}`)}
              className="cursor-pointer overflow-hidden rounded-2xl border border-border bg-surface-alt p-0 text-left transition duration-150 hover:border-accent hover:shadow-soft"
            >
              <div className="p-5">
                <div className="mb-3 inline-flex items-center gap-1 rounded-full bg-accent-tint-2 px-3 py-1 text-xs font-bold text-accent-ink-2">
                  {st.tag}
                </div>
                <p className="mb-3 text-sm leading-normal">
                  <strong>{st.who}</strong> {st.what}
                </p>
                <div className="text-sm font-bold text-accent">
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
