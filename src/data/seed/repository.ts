// Content for the Profile screen, reimagined as a data repository. Three
// collections - uploaded files, saved website links, and facts captured from
// conversations - that the app pulls from when filling in applications and
// reports. This is page content, not part of the shared domain model in
// `types/`.
export type RepositoryItem = {
  id: string;
  /** File name, URL, or the conversational fact itself. */
  label: string;
  /** ISO-ish display date, e.g. "June 6, 2026". */
  date: string;
  /** Portal username who added it. */
  by: string;
};

const BY = "Maya123";

export const REPOSITORY_FILES: RepositoryItem[] = [
  { id: "f1", label: "Annual_Report_2025.pdf", date: "June 6, 2026", by: BY },
  { id: "f2", label: "March_budget_2026.pdf", date: "June 6, 2026", by: BY },
  { id: "f3", label: "Board_roster_2026.pdf", date: "June 6, 2026", by: BY },
  { id: "f4", label: "990_Filing_2024.pdf", date: "June 16, 2026", by: BY },
  { id: "f5", label: "Program_outcomes_Q1.xlsx", date: "June 16, 2026", by: BY },
  { id: "f6", label: "Logic_model_2026.pdf", date: "July 8, 2026", by: BY },
  { id: "f7", label: "Letter_of_support_HealthDept.pdf", date: "July 8, 2026", by: BY },
  { id: "f8", label: "Staff_bios_2026.docx", date: "July 8, 2026", by: BY },
  { id: "f9", label: "Audited_financials_2024.pdf", date: "July 9, 2026", by: BY },
  { id: "f10", label: "Strategic_plan_2025-2028.pdf", date: "July 9, 2026", by: BY },
  { id: "f11", label: "Insurance_certificate.pdf", date: "July 10, 2026", by: BY },
  { id: "f12", label: "Volunteer_handbook.pdf", date: "July 10, 2026", by: BY },
  { id: "f13", label: "Grant_budget_narrative.docx", date: "July 11, 2026", by: BY },
  { id: "f14", label: "Community_survey_results.pdf", date: "July 11, 2026", by: BY },
  { id: "f15", label: "Photo_release_forms.pdf", date: "July 12, 2026", by: BY },
  { id: "f16", label: "IRS_determination_letter.pdf", date: "July 12, 2026", by: BY },
  { id: "f17", label: "Partnership_MOU_FoodBank.pdf", date: "July 13, 2026", by: BY },
  { id: "f18", label: "Impact_report_2025.pdf", date: "July 13, 2026", by: BY },
  { id: "f19", label: "Organizational_chart.pdf", date: "July 13, 2026", by: BY },
  { id: "f20", label: "Diversity_equity_statement.docx", date: "July 13, 2026", by: BY },
];

export const REPOSITORY_LINKS: RepositoryItem[] = [
  { id: "l1", label: "hilltopwellness.org", date: "June 6, 2026", by: BY },
  { id: "l2", label: "hilltopwellness.org/programs", date: "June 6, 2026", by: BY },
  { id: "l3", label: "hilltopwellness.org/impact-2025", date: "June 6, 2026", by: BY },
  { id: "l4", label: "guidestar.org/profile/hilltop-wellness", date: "June 16, 2026", by: BY },
  { id: "l5", label: "facebook.com/HilltopWellnessPGH", date: "June 16, 2026", by: BY },
  { id: "l6", label: "instagram.com/hilltopwellness", date: "July 8, 2026", by: BY },
  { id: "l7", label: "linkedin.com/company/hilltop-wellness", date: "July 8, 2026", by: BY },
  { id: "l8", label: "youtube.com/@hilltopwellness", date: "July 8, 2026", by: BY },
  { id: "l9", label: "hilltopwellness.org/annual-report", date: "July 9, 2026", by: BY },
  { id: "l10", label: "candid.org/profile/hilltop-wellness", date: "July 9, 2026", by: BY },
  { id: "l11", label: "hilltopwellness.org/board", date: "July 10, 2026", by: BY },
  { id: "l12", label: "pghfoodbank.org/partners", date: "July 10, 2026", by: BY },
  { id: "l13", label: "hilltopwellness.org/volunteer", date: "July 11, 2026", by: BY },
  { id: "l14", label: "greatnonprofits.org/org/hilltop-wellness", date: "July 11, 2026", by: BY },
  { id: "l15", label: "hilltopwellness.org/news/heat-resilience", date: "July 12, 2026", by: BY },
  { id: "l16", label: "post-gazette.com/local/hilltop-clinic", date: "July 13, 2026", by: BY },
];

export const REPOSITORY_CONVERSATIONS: RepositoryItem[] = [
  { id: "c1", label: "You served 18 families with funds from the Transform Grant.", date: "June 6, 2026", by: BY },
  { id: "c2", label: "You served 3 communities with funds from the Transform Grant.", date: "June 6, 2026", by: BY },
  { id: "c3", label: "Your chronic-disease workshops reached 240 residents last quarter.", date: "June 6, 2026", by: BY },
  { id: "c4", label: "You partnered with the Pittsburgh Food Bank on a fresh-produce drive.", date: "June 16, 2026", by: BY },
  { id: "c5", label: "Two full-time community health workers joined the team in May.", date: "June 16, 2026", by: BY },
  { id: "c6", label: "You run a free blood-pressure clinic every Tuesday morning.", date: "July 8, 2026", by: BY },
  { id: "c7", label: "Volunteer hours grew 35% year over year.", date: "July 8, 2026", by: BY },
  { id: "c8", label: "You opened a second location in the Hill District this spring.", date: "July 8, 2026", by: BY },
  { id: "c9", label: "Your cooling-center program served 90 people during the July heat wave.", date: "July 9, 2026", by: BY },
  { id: "c10", label: "You secured a three-year commitment from the Heinz Endowments.", date: "July 9, 2026", by: BY },
  { id: "c11", label: "The digital-literacy program enrolled 45 teens this cohort.", date: "July 10, 2026", by: BY },
  { id: "c12", label: "You distributed 1,200 meals through the mobile pantry in June.", date: "July 10, 2026", by: BY },
  { id: "c13", label: "Your board added two new members with public-health backgrounds.", date: "July 11, 2026", by: BY },
  { id: "c14", label: "You launched a Spanish-language outreach line in April.", date: "July 11, 2026", by: BY },
  { id: "c15", label: "Program satisfaction scores averaged 4.7 out of 5 last quarter.", date: "July 12, 2026", by: BY },
  { id: "c16", label: "You matched 60 residents with primary-care providers this year.", date: "July 13, 2026", by: BY },
];
