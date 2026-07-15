import type Grant from "@/types/grant";
import type Initiative from "@/types/initiative";
import GrantRecord, { GrantLifecycleStage } from "@/types/grantRecord";

export function getGrantRecord(
  initiative: Initiative,
  grantId: string,
): GrantRecord | undefined {
  return initiative.grantRecords.get(grantId);
}

export function isSaved(record: GrantRecord | undefined): boolean {
  if (!record) return false;
  return (
    record.stage !== GrantLifecycleStage.NotSaved &&
    record.stage !== GrantLifecycleStage.Unsaved
  );
}

export type SearchFilters = {
  query: string;
  // Issue tags and locations are free-form: the presets are suggestions, but
  // the user can type their own, so these are plain strings rather than the
  // canonical `Issue` union.
  issues: string[];
  // At most one organization type (radio, single-select). Empty = any.
  orgTypes: string[];
  locations: string[];
  deadlineFrom: string;
  deadlineTo: string;
  fundMin: number;
  fundMax: number;
};

export const DEFAULT_FILTERS: SearchFilters = {
  query: "",
  issues: [],
  orgTypes: [],
  locations: [],
  deadlineFrom: "",
  deadlineTo: "",
  fundMin: 0,
  fundMax: 100000,
};

export function filterGrants(grants: Grant[], filters: SearchFilters): Grant[] {
  return grants.filter((grant) => {
    if (filters.query.trim()) {
      const q = filters.query.trim().toLowerCase();
      const haystack =
        `${grant.purpose} ${grant.grantor} ${grant.issues.join(" ")}`.toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    if (
      filters.issues.length > 0 &&
      !filters.issues.some((i) => (grant.issues as string[]).includes(i))
    ) {
      return false;
    }
    // Org-type eligibility isn't a discrete field on Grant (it lives inside
    // free-text `requirements.eligibility`), so this filter is UI-only for
    // now and doesn't narrow results - every seed grant accepts the org
    // types offered in the sidebar.
    if (filters.locations.length > 0) {
      const grantRegionNames = grant.targetRegions.map((r) => r.name);
      if (!filters.locations.some((l) => grantRegionNames.includes(l)))
        return false;
    }
    if (filters.deadlineFrom) {
      const from = new Date(filters.deadlineFrom);
      if (grant.timeline.applicationWindowEnd < from) return false;
    }
    if (filters.deadlineTo) {
      const to = new Date(filters.deadlineTo);
      if (grant.timeline.applicationWindowEnd > to) return false;
    }
    if (
      grant.award.totalAmount < filters.fundMin ||
      grant.award.totalAmount > filters.fundMax
    ) {
      return false;
    }
    return true;
  });
}

export type SortOption = "relevance" | "fit" | "deadline" | "amount";

export function sortGrants(grants: Grant[], sortBy: SortOption): Grant[] {
  const copy = [...grants];
  switch (sortBy) {
    case "fit":
      return copy.sort(
        (a, b) => Number(b.isRecommended) - Number(a.isRecommended),
      );
    case "deadline":
      return copy.sort(
        (a, b) =>
          a.timeline.applicationWindowEnd.getTime() -
          b.timeline.applicationWindowEnd.getTime(),
      );
    case "amount":
      return copy.sort((a, b) => b.award.totalAmount - a.award.totalAmount);
    case "relevance":
    default:
      return copy;
  }
}

export const ORG_TYPE_OPTIONS: { id: string; label: string; hint: string }[] = [
  {
    id: "nonprofit",
    label: "501(c)(3) nonprofit",
    hint: "Independently incorporated nonprofit organization.",
  },
  {
    id: "fiscally-sponsored",
    label: "Fiscally sponsored project",
    hint: "Operates under a sponsoring nonprofit's status.",
  },
  {
    id: "social-enterprise",
    label: "Social enterprise",
    hint: "Mission-driven, may have earned revenue.",
  },
  {
    id: "community-group",
    label: "Community group",
    hint: "Informal resident-led group without 501(c)(3) status.",
  },
];

export const LOCATION_OPTIONS = [
  "City of Pittsburgh",
  "Allegheny County",
  "Westmoreland County",
  "Beaver County",
  "Butler County",
  "Washington County",
  "Armstrong County",
  "Fayette County",
  "Hill District",
  "East Liberty",
  "Homestead",
  "McKeesport",
];

// Broad issue tags surfaced in the Explore search filter and onboarding. Shared
// so the two stay in sync.
export const ISSUE_TAGS: readonly string[] = [
  "Arts",
  "Black-Led",
  "Community Development",
  "Disabilities",
  "Education",
  "Environment/EJ",
  "Faith-Based",
  "Food",
  "Health/Wellness",
  "Housing",
  "Innovation",
  "Justice/Equality",
  "Literary",
  "Mothers",
  "Queer Led/Serving",
  "Recreation",
  "Social Services",
  "Sustainability",
  "Technology",
  "Water",
  "Women-Led",
  "Workforce Development",
  "Youth",
];
