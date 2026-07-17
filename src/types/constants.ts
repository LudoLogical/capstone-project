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
 * The categories of data points present in the Vibrancy Index dataset.
 */
export const INDICATORS = [
  "air quality",
  "business",
  "carbon footprint",
  "chronic disease",
  "employment",
  "food access",
  "green infrastructure",
  "homeownership",
  "household income",
  "internet",
  "physical activity",
] as const;

/**
 * A category of data points present in the Vibrancy Index dataset.
 */
export type Indicator = (typeof INDICATORS)[number];

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
