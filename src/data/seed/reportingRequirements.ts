import type { ReportingRequirement } from "@/types/grant";

/**
 * The reporting requirements every report in this prototype is built from.
 *
 * In production these are generated: the user pastes what their funder asks for
 * into the requirements gate, that text goes to the AI responsible for turning
 * it into `ReportingRequirement`s, and its output replaces this constant. The
 * gate already hands the flow a `ReportingRequirement[]`, so that swap is the
 * only change needed - everything downstream (the step rail, one conversation
 * per requirement, the review groupings) is derived from the array either way.
 *
 * Until then the gate's input is collected but not read, which trades a
 * responsive gate for a report flow that behaves the same way every time.
 *
 * The wording is deliberately grant-agnostic: this same set is used whichever
 * grant the user is reporting on, so nothing here can name a specific program,
 * population, or issue area.
 */
export const REPORTING_REQUIREMENTS: ReportingRequirement[] = [
  {
    shortName: "Funded commitments",
    statement:
      "State the program activities you committed to delivering with this award.",
    question: "What did you commit to doing with this grant?",
  },
  {
    shortName: "Activities delivered",
    statement:
      "List the events and activities you ran during the award term.",
    question: "What events or activities did you run?",
  },
  {
    shortName: "People reached",
    statement:
      "Report the number of people your work reached and the neighborhoods in which they live.",
    question: "Who did this work reach?",
  },
  {
    shortName: "Outcomes",
    statement: "Report the change that resulted from the funded work.",
    question: "What changed as a result of this work?",
  },
];
