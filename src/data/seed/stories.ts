// Success-story content shown on the Landing page. This is page copy, not
// part of the shared domain model in `types/`, so it gets its own local
// shape here rather than trying to force it into Initiative/Grant.
export type Story = {
  id: string;
  who: string;
  what: string;
  tag: string;
  org: string;
  grant: string;
  quote: string;
  person: string;
  body: string[];
};

export const STORIES: Story[] = [
  {
    id: "s-northview-gardens",
    who: "Northview Gardens",
    what: "turned three years of program attendance sheets into a reporting narrative that took an afternoon, not a month.",
    tag: "Reporting",
    org: "Northview Gardens",
    grant: "Neighborhood Food Access Grant",
    quote:
      "I used to dread report season. This time I opened the wizard, checked the boxes for what I'd already uploaded, and had a draft before lunch.",
    person: "Dana Okafor, Program Director",
    body: [
      "Northview Gardens runs a community growing space and weekly produce stand in Northview Heights. For years, their end-of-grant reports were assembled by hand from spreadsheets, sign-in sheets, and whatever the program director could remember from the season.",
      "When their Neighborhood Food Access Grant reporting deadline came up, they used the Vibrancy Portal's Repository Report Flow instead. The tool walked them through the same four questions every funder asks — commitment, events run, community served, outcomes — and surfaced supporting data from both their own uploaded records and the Vibrancy Index.",
      "The final report paired their raw counts with county-level context, something they'd never had the time to research on their own. It was submitted four days after the reporting window opened.",
    ],
  },
  {
    id: "s-beltzhoover-together",
    who: "Beltzhoover Together",
    what: "found a co-applicant two neighborhoods over and split a $40,000 award instead of applying alone.",
    tag: "Collaboration",
    org: "Beltzhoover Together",
    grant: "Green Spaces & Climate Resilience Fund",
    quote:
      "We'd never have found each other cold. The overlap signals gave us a reason to reach out, and NSR made the introduction feel safe.",
    person: "Marcus Webb, Executive Director",
    body: [
      "Beltzhoover Together had a green-space proposal that was strong on community buy-in but thin on technical planning experience.",
      "Browsing the Collaborate tab for the Green Spaces & Climate Resilience Fund, they noticed an organization with overlapping funders and a nearby service area that had the exact landscape-planning experience they lacked.",
      "They requested an introduction. New Sun Rising staff reviewed the request, confirmed both organizations were comfortable connecting, and made the introduction personally rather than sending an automated email. The two organizations co-applied and were awarded the grant three months later.",
    ],
  },
  {
    id: "s-east-end-youth-lab",
    who: "East End Youth Lab",
    what: "went from 'we don't know what grants we qualify for' to a shortlist of five in one afternoon.",
    tag: "Finding grants",
    org: "East End Youth Lab",
    grant: "Youth Digital Wellness Grant",
    quote:
      "I typed in what we actually do, in plain language, and it came back with grants I'd never have found searching manually.",
    person: "Priya Chandrasekaran, Founder",
    body: [
      "East End Youth Lab is a two-person operation teaching coding and media literacy to teens after school. Grant research wasn't anyone's full-time job — it happened in stolen hours between programming.",
      "Using the Vibrancy Portal's search, they described their program in plain language and let the tool rank grants by fit instead of scrolling through a directory sorted by deadline.",
      "The Youth Digital Wellness Grant surfaced near the top of the list. The eligibility criteria matched almost exactly, something they might have missed if they were searching by keyword alone.",
    ],
  },
];
