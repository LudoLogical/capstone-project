# Outstanding Implementation Tasks

## Features

- The entire application is missing an auth layer
- The entire application is missing a relational database (integration with NSR's existing PostgreSQL database is recommended)
- The grant ingestion mechanism needs to be configured to run as a `cron` job and actually store the information it collects
- Users should be able to work with grants that do not exist in the database by supplying the raw content of the corresponding listings via file upload and/or copying and pasting
- Users should be able to create and manage multiple application workflows and report workflows for each grant
- The formula that powers the relevance metric needs to be implemented as code (see [RELEVANCE.md](./RELEVANCE.md))
- The following AI workloads are missing system prompts, response schemas, and TypeScript invocations:
  - Organization-specific grant alignment analysis
  - Distillation of `ReportingRequirement` instances from user-supplied `string`s for the report workflow
  - Real-time novel `ChatSource` identification during conversations with the AI assistant in the report workflow
- The warm introductions feature needs to be integrated with the Vibrancy Portal's email server
- The content of the files and webpages supplied by users need to actually get extracted, parsed, and stored
- `AuthoritativeDatum` and `NSRServiceDatum` instances need to actually get retrieved (see [src/data/external.ts](../src/data/external.ts))
- `getCensusTracts` has not been implemented yet (see [src/data/external.ts](../src/data/external.ts))
- The custom `Location`/`Region` input fields are currently missing search suggestions

## Content

- The list of `Issues` and the list of default communities served should be replaced with more refined and comprehensive versions that can be easily updated over time
- The grant ingestion mechanism needs an easily updatable list of URLs that serve as hubs for grant opportunities to use as starting points
- The success stories displayed at the bottom of the dashboard are currently hard-coded

## Interface fixes
- [/account](../src/app/account/page.tsx): the buttons for removing sources are missing confirmation modals
- [/grants/[grantId]/report](../src/app/grants/[grantId]/report/page.tsx) (in [ReportQuestionStep](../src/app/grants/[grantId]/report/ReportQuestionStep.tsx)): file type validation is inconsistent with the rest of the application (e.g., [DataUploadField](../src/components/analysis/DataUploadField.tsx))
- [/search](../src/app/search/page.tsx): non-relevance sort criteria are missing a direction toggle (ascending vs descending)
- [/search](../src/app/search/page.tsx): the date picker is still the browser/system default
- (multiple routes): [CheckboxRow](../src/components/primitives/CheckboxRow.tsx) and [RadioRow](../src/components/primitives/RadioRow.tsx) do not use the appropriate HTML elements, which is currently causing accessibility issues related to focus states
- (multiple routes): the UI is poorly optimized for mobile devices due to a lack of responsive design in several places

## Codebase cleanup

- The `ingestGrant` function in `src/ai/tasks.ts` needs to be adapted to work with the [Gemini Batch API](https://ai.google.dev/gemini-api/docs/batch-api)
- The `scrapeLinksAtDepth` function in `src/ai/tasks.ts` needs to compute hashes of the webpage content that it encounters, cache those hashes, and use them during subsequent invocations to detect content changes over time (and thus save money by avoiding unnecessary invocations of `ingestGrant`)
- The [ApplyReviewStep](../src/app/grants/[grantId]/apply/ApplyReviewStep.tsx) and [ReportReviewStep](../src/app/grants/[grantId]/report/ReportReviewStep.tsx) components can and should be merged into a single `ReviewStep` component
- The [ApplyStepRail](../src/app/grants/[grantId]/apply/ApplyStepRail.tsx) and [ReportStepRail](../src/app/grants/[grantId]/report/ReportStepRail.tsx) components can and should be merged into a single `StepRail` component
- The AI system prompts and response schemas defined in the analysis card documentation need to be added to `src/ai`
- Progress visualization code that used to be used in the dashboard is now vestigial and needs to be removed
- The conditions under which the [ApplyStepRail](../src/app/grants/[grantId]/apply/ApplyStepRail.tsx) and [ReportStepRail](../src/app/grants/[grantId]/report/ReportStepRail.tsx) components are slightly inaccurate
- The `ISSUES` constant defined in `src/types` is out of date and needs to be replaced with the contents of the `ISSUE_TAGS` constant currently located in `src/data`