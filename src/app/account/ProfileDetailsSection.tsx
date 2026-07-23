"use client";

import { useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { ISSUE_TAGS, LOCATION_OPTIONS } from "@/data/selectors";
import { regionNamed, sameRegion, unlistedRegions } from "@/data/seed/geo";
import type { Region } from "@/types/geo";
import ProfileReadRow from "@/app/account/ProfileReadRow";
import ProfileReadTags from "@/app/account/ProfileReadTags";
import { Plus } from "lucide-react";

/**
 * Your details, editable in place. This is the same information onboarding
 * collects, so it's edited with the same tag lists rather than sending the user
 * back through setup to change one thing.
 */
export default function ProfileDetailsSection() {
  const org = useAppStore((s) => s.onboardOrg);
  const patchOrg = useAppStore((s) => s.patchOnboardOrg);
  const toggleIssue = useAppStore((s) => s.toggleOnboardIssue);
  const toggleArea = useAppStore((s) => s.toggleOnboardArea);
  const addToast = useAppStore((s) => s.addToast);
  const [editing, setEditing] = useState(false);
  // Text fields are edited as a draft so a half-typed value never lands in the
  // store.
  const [person, setPerson] = useState(org.person);
  const [name, setName] = useState(org.name);
  const [email, setEmail] = useState(org.email);

  // The tag chips write to the store on click, so cancelling has to put the
  // lists back the way they were when editing started.
  const [tagsAtEntry, setTagsAtEntry] = useState({
    issues: org.issues,
    areas: org.areas,
  });

  const [areaDraft, setAreaDraft] = useState("");

  const isPicked = (region: Region) =>
    org.areas.some((a) => sameRegion(a, region));

  // Stands in for the location picker this becomes in production: there, the
  // field would suggest places as the user types and hand back a geocoded
  // Region. Here the name is taken as given and `regionNamed` turns it into the
  // same shape, so only the field itself changes later.
  const addArea = () => {
    const region = regionNamed(areaDraft);
    if (region.name && !isPicked(region)) toggleArea(region);
    setAreaDraft("");
  };

  const startEditing = () => {
    setPerson(org.person);
    setName(org.name);
    setEmail(org.email);
    setTagsAtEntry({ issues: org.issues, areas: org.areas });
    setAreaDraft("");
    setEditing(true);
  };
  const save = () => {
    patchOrg({
      person: person.trim(),
      name: name.trim(),
      email: email.trim(),
    });
    setEditing(false);
    addToast("Profile updated.");
  };
  const cancel = () => {
    patchOrg({ issues: tagsAtEntry.issues, areas: tagsAtEntry.areas });
    setEditing(false);
  };

  const chip = (active: boolean) =>
    `rounded-full border px-3 py-1.5 text-xs font-bold transition duration-150 ${
      active
        ? "border-accent bg-accent text-white"
        : "border-border-strong bg-white text-ink-secondary hover:border-accent"
    }`;

  return (
    <section className="mb-12">
      <h2 className="mb-1.5 font-serif text-xl leading-tight font-bold">
        Basics
      </h2>
      <p className="mb-3.5 max-w-2xl text-sm leading-relaxed text-ink-muted">
        We use this information to personalize your experience, match you with
        grants, and, with your permission, introduce you to potential
        collaborators.
      </p>
      <div className="flex items-start justify-between gap-3 mb-1 rounded-2xl border border-border bg-surface p-6">
        {editing ? (
          // Spans the card so the footer buttons land on its right edge.
          <div className="flex flex-1 flex-col gap-4">
            <div>
              <label className="mb-1.5 block text-xs font-bold tracking-wider text-ink-muted uppercase">
                Your name
              </label>
              <input
                value={person}
                onChange={(e) => setPerson(e.target.value)}
                placeholder="e.g. Maya Torres"
                className="w-full rounded-xl border border-border-strong bg-white px-4 py-2.5 text-sm text-ink outline-none focus:border-accent"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-bold tracking-wider text-ink-muted uppercase">
                Organization name
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Hilltop Wellness Collective"
                className="w-full rounded-xl border border-border-strong bg-white px-4 py-2.5 text-sm text-ink outline-none focus:border-accent"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-bold tracking-wider text-ink-muted uppercase">
                Contact email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. hello@hilltopwellness.org"
                className="w-full rounded-xl border border-border-strong bg-white px-4 py-2.5 text-sm text-ink outline-none focus:border-accent"
              />
            </div>
            <div>
              <div className="mb-2 text-xs font-bold tracking-wider text-ink-muted uppercase">
                Focus areas
              </div>
              <div className="flex flex-wrap gap-2">
                {ISSUE_TAGS.map((issue) => (
                  <button
                    key={issue}
                    onClick={() => toggleIssue(issue)}
                    aria-pressed={org.issues.includes(issue)}
                    className={chip(org.issues.includes(issue))}
                  >
                    {issue}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <div className="mb-2 text-xs font-bold tracking-wider text-ink-muted uppercase">
                Communities you serve
              </div>
              {/* The presets, then anything the user named themselves - shown
                  the same way, so an added place can be unpicked like any
                  other. */}
              <div className="mb-2.5 flex flex-wrap gap-2">
                {[
                  ...LOCATION_OPTIONS,
                  ...unlistedRegions(org.areas, LOCATION_OPTIONS),
                ].map((area) => (
                  <button
                    key={area.name}
                    onClick={() => toggleArea(area)}
                    aria-pressed={isPicked(area)}
                    className={chip(isPicked(area))}
                  >
                    {area.name}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  value={areaDraft}
                  onChange={(e) => setAreaDraft(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addArea()}
                  placeholder="Somewhere else? Add it here."
                  aria-label="Add a community you serve"
                  className="min-w-0 flex-1 rounded-xl border border-border-strong bg-white px-4 py-2 text-sm text-ink outline-none focus:border-accent"
                />
                <button
                  onClick={addArea}
                  disabled={!areaDraft.trim()}
                  className="inline-flex flex-none items-center gap-2 rounded-lg border border-border-strong bg-white px-4 py-2 text-sm font-semibold whitespace-nowrap text-ink transition duration-150 enabled:hover:border-accent disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Plus size={14} className="shrink-0" /> Add
                </button>
              </div>
            </div>
            <div className="flex justify-end gap-2.5">
              <button
                onClick={cancel}
                className="rounded-lg border border-border-strong bg-white px-4 py-2.5 text-sm font-semibold text-ink transition duration-150 hover:border-accent"
              >
                Cancel
              </button>
              <button
                onClick={save}
                className="rounded-lg bg-accent-ink px-4 py-2.5 text-sm font-semibold text-white shadow-cta transition duration-150 hover:bg-accent-ink-2 active:translate-y-px"
              >
                Save changes
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {/* Raw values, not the `usePersonName`/`useOrgName` stand-ins: this
                row has its own "Not set yet" empty state. */}
            <ProfileReadRow label="Your name" value={org.person.trim()} />
            <ProfileReadRow label="Organization name" value={org.name.trim()} />
            <ProfileReadRow label="Contact email" value={org.email.trim()} />
            <ProfileReadTags label="Focus areas" values={org.issues} />
            <ProfileReadTags
              label="Communities you serve"
              values={org.areas.map((a) => a.name)}
            />
          </div>
        )}
        {!editing && (
          <button
            onClick={startEditing}
            className="flex-none rounded-lg border border-border-strong bg-white px-3 py-1.5 text-xs font-semibold text-ink transition duration-150 hover:border-accent"
          >
            Edit
          </button>
        )}
      </div>
    </section>
  );
}
