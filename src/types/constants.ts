/**
 * The domains that an Initiative or Grant may focus on or target.
 */
export const ISSUES = [
  "Community",
  "Environment",
  "Food Security",
  "Health",
  "Technology",
  "Youth",
] as const;

/**
 * A domain that an Initiative or Grant may focus on or target.
 */
export type Issue = (typeof ISSUES)[number];

/**
 * The entities that publish and manage Grants.
 */
export const GRANTORS = [
  "Pittsburgh City Council",
  "Hunger-Free PA",
  "Grable Foundation",
  "Heinz Endowments",
  "POISE Foundation",
  "Allegheny County DHS",
  "The Pittsburgh Foundation",
  "Allegheny County Health Department",
  "Richard King Mellon Foundation",
  "Staunton Farm Foundation",
  "New Sun Rising",
  "PNC Foundation",
] as const;

/**
 * An entity that publishes and manages a Grant.
 */
export type Grantor = (typeof GRANTORS)[number];
