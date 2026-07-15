export type JargonEntry = { term: string; definition: string };

export const JARGON: Record<string, JargonEntry> = {
  censusTract: {
    term: "Census tract",
    definition:
      "A small, relatively permanent area the US Census Bureau uses to report statistics - usually a few thousand residents. It's the smallest area most funder-cited data is available for.",
  },
  countyAvg: {
    term: "County average",
    definition:
      "The average value of a statistic across every neighborhood in the county, used here as a baseline to show whether your area is above or below typical.",
  },
  vcf: {
    term: "Vibrant Communities Framework",
    definition:
      "New Sun Rising's framework for describing neighborhood health across five categories: About Us, What We Do, Our Results, Who We Serve & Work With, and What We're Asking For.",
  },
  vibrancyPortal: {
    term: "Vibrancy Portal",
    definition:
      "This tool. It connects the Vibrancy Index (neighborhood-level data New Sun Rising maintains) with your own organization's data to help you find and apply for grants.",
  },
  fsp: {
    term: "Fiscally sponsored project",
    definition:
      "A community project that doesn't have its own 501(c)(3) status, but operates under the nonprofit status of a sponsoring organization like New Sun Rising.",
  },
  ruea: {
    term: "Remember / Understand / Evaluate / Apply",
    definition:
      "The four-part explanation pattern used throughout the portal: the raw number, what it means in plain language, how it compares to context, and how to use it in your application or report.",
  },
  discoverable: {
    term: "Discoverable",
    definition:
      "When you mark yourself discoverable for a grant, other organizations applying for the same grant can see a limited profile of your organization and request an introduction. Your contact details stay private until you choose to share them.",
  },
  profile: {
    term: "Initiative profile",
    definition:
      "The issues you work on, the regions you serve, and other org-level facts stored in your Account Profile. AI ranking uses this profile - never external data about you - to suggest grants.",
  },
  fit: {
    term: "Estimated fit",
    definition:
      "An AI-generated estimate of how well a grant's eligibility, focus areas, and funding range match your organization's profile and past applications. It is not a judgment about whether you'll be awarded the grant.",
  },
};
