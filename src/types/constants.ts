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

/**
 * The file types that are acceptable as DocumentSources.
 */
export const DOCUMENT_SOURCE_TYPES = [
  "txt",
  "md",
  "doc",
  "docx",
  "csv",
  "xlsx",
  "ppt",
  "pptx",
  "pdf",
] as const;

/**
 * A file type that is acceptable as a DocumentSources.
 */
export type DocumentSourceType = (typeof DOCUMENT_SOURCE_TYPES)[number];

/**
 * The file type of an uploaded document, read off its name, or `null` if it
 * isn't one we accept. A file picker's `accept` filter is only a hint - a user
 * can always override it in the OS dialog - so uploads are checked with this
 * wherever they are taken in.
 */
export function documentType(fileName: string): DocumentSourceType | null {
  const ext = fileName.split(".").pop()?.toLowerCase();
  return DOCUMENT_SOURCE_TYPES.find((t) => t === ext) ?? null;
}
