"use client";

import { useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { ISSUE_TAGS, LOCATION_OPTIONS } from "@/data/selectors";
import ProfileReadRow from "@/app/account/ProfileReadRow";
import ProfileReadTags from "@/app/account/ProfileReadTags";

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
  // Names are edited as a draft so a half-typed name never lands in the store.
  const [person, setPerson] = useState(org.person);
  const [name, setName] = useState(org.name);

  // The tag chips write to the store on click, so cancelling has to put the
  // lists back the way they were when editing started.
  const [tagsAtEntry, setTagsAtEntry] = useState({
    issues: org.issues,
    areas: org.areas,
  });

  const startEditing = () => {
    setPerson(org.person);
    setName(org.name);
    setTagsAtEntry({ issues: org.issues, areas: org.areas });
    setEditing(true);
  };
  const save = () => {
    patchOrg({ person: person.trim(), name: name.trim() });
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
          <div className="flex flex-col gap-4">
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
              <div className="mb-2 text-xs font-bold tracking-wider text-ink-muted uppercase">
                Issues you focus on
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
              <div className="flex flex-wrap gap-2">
                {LOCATION_OPTIONS.map((area) => (
                  <button
                    key={area}
                    onClick={() => toggleArea(area)}
                    aria-pressed={org.areas.includes(area)}
                    className={chip(org.areas.includes(area))}
                  >
                    {area}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-2.5">
              <button
                onClick={save}
                className="rounded-lg bg-accent-ink px-4 py-2.5 text-sm font-semibold text-white shadow-cta transition duration-150 hover:bg-accent-ink-2 active:translate-y-px"
              >
                Save changes
              </button>
              <button
                onClick={cancel}
                className="rounded-lg border border-border-strong bg-white px-4 py-2.5 text-sm font-semibold text-ink transition duration-150 hover:border-accent"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {/* Raw values, not the `usePersonName`/`useOrgName` stand-ins: this
                row has its own "Not set yet" empty state. */}
            <ProfileReadRow label="Your name" value={org.person.trim()} />
            <ProfileReadRow label="Organization name" value={org.name.trim()} />
            <ProfileReadTags label="Issues you work on" values={org.issues} />
            <ProfileReadTags label="Where you serve" values={org.areas} />
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
