// Content for the "Cite" / source-provenance modal. Keyed by the same ids
// used in the RUEA cards. This is presentation metadata about a Datum, not
// part of the shared domain model.
export type ProvenanceEntry = {
  title: string;
  source: string;
  fields: { label: string; value: string }[];
  note: string;
};

export const PROVENANCE: Record<string, ProvenanceEntry> = {
  cvd: {
    title: "Cardiovascular disease rate",
    source: "Allegheny County Health Department, 2025 Community Health Assessment",
    fields: [
      { label: "Geography", value: "Hilltop, Pittsburgh, PA" },
      { label: "Metric", value: "% of adults with a diagnosed cardiovascular condition" },
      { label: "Value", value: "8.4%" },
      { label: "Collected", value: "2025" },
    ],
    note: "AI can make mistakes. Always confirm figures against the original source before submitting an application.",
  },
  produce: {
    title: "Fresh produce access",
    source: "Vibrancy Index, Food Access Layer, 2025",
    fields: [
      { label: "Geography", value: "Hilltop, Pittsburgh, PA" },
      { label: "Metric", value: "% of households within a 10-minute walk of fresh produce" },
      { label: "Value", value: "61%" },
      { label: "Collected", value: "2025" },
    ],
    note: "AI can make mistakes. Always confirm figures against the original source before submitting an application.",
  },
  served: {
    title: "Residents reached",
    source: "Hilltop Wellness Collective, 2025 Annual Impact Survey",
    fields: [
      { label: "Metric", value: "Unique residents served across all programs" },
      { label: "Value", value: "1,240" },
      { label: "Reporting period", value: "Jan – Dec 2025" },
    ],
    note: "This figure comes from a document you uploaded, not from the Vibrancy Index.",
  },
  fit: {
    title: "Estimated fit",
    source: "Derived from 18 past funded applications with a similar profile",
    fields: [
      { label: "Basis", value: "Eligibility match, focus-area overlap, funding-range alignment" },
      { label: "Comparable applications", value: "18" },
    ],
    note: "AI can make mistakes, and this score is not a judgment about whether you'll be awarded the grant — that decision belongs to the funder.",
  },
};
