/**
 * The domains that an Initiative or Grant may focus on or target.
 */
export const ISSUES = [
  /* ... */
] as const;

/**
 * A domain that an Initiative or Grant may focus on or target.
 */
export type Issue = (typeof ISSUES)[number];

/**
 * The entities that publish and manage Grants.
 */
export const GRANTORS = [
  /* ... */
] as const;

/**
 * An entity that publishes and manages a Grant.
 */
export type Grantor = (typeof GRANTORS)[number];
