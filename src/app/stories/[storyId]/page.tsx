"use client";

import { useParams, useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { STORIES } from "@/data/seed";
import BackButton from "@/components/primitives/BackButton";

export default function StoryDetailPage() {
  const { storyId } = useParams<{ storyId: string }>();
  const router = useRouter();
  const story = STORIES.find((s) => s.id === storyId);

  if (!story) {
    return (
      <div className="animate-nc-rise mx-auto w-full px-8 pt-7 pb-28">
        <p className="leading-relaxed">Story not found.</p>
        <BackButton />
      </div>
    );
  }

  return (
    <div className="animate-nc-rise mx-auto w-full px-8 pt-7 pb-28">
      <BackButton />
      <div className="overflow-hidden rounded-2xl border border-border bg-surface">
        <div className="flex h-48 items-center justify-center bg-accent text-7xl">
          <span aria-hidden>{story.emoji}</span>
        </div>
        <div className="p-8">
        <div className="mb-3.5 inline-flex items-center gap-1 rounded-full bg-accent-tint-2 px-3 py-1 text-xs font-bold text-accent-ink-2">
          {story.tag}
        </div>
        <h1 className="mb-1.5 font-serif text-3xl leading-tight font-bold">
          {story.who}
        </h1>
        <div className="mb-5 text-sm text-ink-muted">
          {story.org} · {story.grant}
        </div>
        <div className="mb-6 border-l-3 border-accent py-1.5 pl-4">
          <p className="mb-2 font-serif text-lg leading-normal text-ink-body italic">
            “{story.quote}”
          </p>
          <div className="text-sm font-semibold text-ink-muted">
            {story.person}
          </div>
        </div>
        <div className="flex flex-col gap-4">
          {story.body.map((para, i) => (
            <p key={i} className="text-base leading-relaxed text-ink-body">
              {para}
            </p>
          ))}
        </div>
        <div className="mt-7 flex flex-wrap gap-2.5 border-t border-divider-2 pt-6">
          <button
            onClick={() => router.push("/search")}
            className="inline-flex items-center gap-2 rounded-xl bg-accent-ink px-5 py-3 text-sm font-semibold whitespace-nowrap text-white shadow-cta transition duration-150 enabled:hover:bg-accent-ink-2 enabled:active:translate-y-px disabled:cursor-not-allowed disabled:opacity-50"
          >
            Start your own <ArrowRight size={16} className="shrink-0" />
          </button>
          <BackButton className="inline-flex items-center gap-2 rounded-xl border border-border-strong bg-white px-5 py-3 text-sm font-semibold whitespace-nowrap text-ink transition duration-150 enabled:hover:border-accent" />
        </div>
        </div>
      </div>
    </div>
  );
}
