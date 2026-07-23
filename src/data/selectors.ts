import type Grant from "@/types/grant";
import type { Region } from "@/types/geo";
import GrantRecord, { GrantLifecycleStage } from "@/types/grantRecord";
import { regionNamed, sameRegion } from "@/data/seed/geo";

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
  // Places, not place names: the user can add one the presets don't list, and
  // a Region is what the rest of the model means by a place. See `regionNamed`.
  locations: Region[];
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
    if (filters.issues.length > 0) {
      // The sidebar's tags are broader than the issues carried on a grant
      // ("Health/Wellness" vs "Health"), so a tag matches through the map above
      // rather than by string equality.
      const wanted = new Set(
        filters.issues.flatMap((tag) => TAG_ISSUES[tag] ?? [tag]),
      );
      if (!grant.issues.some((i) => wanted.has(i))) return false;
    }
    // Org-type eligibility isn't a discrete field on Grant (it lives inside
    // free-text `requirements.eligibility`), so this filter is UI-only for
    // now and doesn't narrow results - every seed grant accepts the org
    // types offered in the sidebar.
    if (filters.locations.length > 0) {
      // Matched by name: a Region the user typed in has no boundary to test a
      // grant's target regions against, and two Regions that name the same
      // place are the same place.
      if (
        !filters.locations.some((l) =>
          grant.targetRegions.some((r) => sameRegion(r, l)),
        )
      )
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

export const ORG_TYPE_OPTIONS: { id: string; label: string; hint?: string }[] =
  [
    {
      id: "nonprofit",
      label: "501(c)(3) nonprofit",
      hint: "An independently incorporated non-profit organization.",
    },
    {
      id: "fiscally-sponsored",
      label: "Fiscally sponsored project",
      hint: "Operates under the sponsorship of an incorporated non-profit.",
    },
    {
      id: "social-enterprise",
      label: "Social enterprise",
      hint: "Mission-driven, but may have earned revenue.",
    },
    {
      id: "other",
      label: "Other",
    },
  ];

/**
 * The places offered as one-click options wherever a user picks where they
 * work or where funding must be spent.
 *
 * Resolved through `regionNamed`, so the four the seed has drawn arrive with
 * their real boundaries and the rest arrive as named places with none - the
 * same shape anything the user types in gets.
 */
export const LOCATION_OPTIONS: Region[] = [
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
].map(regionNamed);

// Broad issue tags surfaced in the Explore search filter and onboarding. Shared
// so the two stay in sync.
/**
 * How each sidebar tag maps onto the canonical issues a grant is tagged with.
 * Without this the filter would compare "Food" against "Food Security" and
 * silently match nothing.
 */
export const TAG_ISSUES: Record<string, string[]> = {
  Arts: ["Community"],
  "Black-Led": ["Community"],
  "Community Development": ["Community"],
  Disabilities: ["Health", "Community"],
  Education: ["Youth"],
  "Environment/EJ": ["Environment"],
  "Faith-Based": ["Community"],
  Food: ["Food Security"],
  "Health/Wellness": ["Health"],
  Housing: ["Community"],
  Innovation: ["Technology"],
  "Justice/Equality": ["Community"],
  Literary: ["Youth", "Community"],
  Mothers: ["Community", "Health"],
  "Queer Led/Serving": ["Community"],
  Recreation: ["Community", "Health"],
  "Social Services": ["Community"],
  Sustainability: ["Environment"],
  Technology: ["Technology"],
  Water: ["Environment"],
  "Women-Led": ["Community"],
  "Workforce Development": ["Community"],
  Youth: ["Youth"],
};

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
