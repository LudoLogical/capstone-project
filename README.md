# New Sun Rising — Vibrancy Portal

A web app built on the **type structure of the MHCI 2026 NSR capstone project**, with the
**UI/UX of the "Vibrancy Portal" design**. It's a grant-discovery, application, impact-tracking,
and reporting tool for fiscally-sponsored community Initiatives.

- **Stack:** React 18 + TypeScript + Vite
- **Run:** `npm install && npm run dev` → http://localhost:5390
- **Typecheck:** `npm run typecheck` · **Build:** `npm run build`

## Design fidelity

Every screen from the design is implemented, sharing one design system (indigo `#4f46e5`,
Inter / JetBrains Mono, the exact card, chip, badge, and progress-bar treatments):

Onboarding · Dashboard · Explore · Grant Detail · Collaborators · Org Profile ·
Flow (shared Write **and** Report composer with the periphery AI sidebar) · Brief ·
Track (planning + gathering) · Report Select · Living Profile · plus the full modal set
(save + opt-in, unsave, discoverable, AI transparency, share, warm-intro email, source info).

## Project structure

```
types/                 # UNCHANGED domain types from the capstone ZIP (see note below)
gemini.ts, examples/   # UNCHANGED files carried over from the capstone ZIP
src/
  data/                # ── the engineered project population ──
    geo.ts             #   Locations + Regions (Pittsburgh) with GeoPolygon rings
    data.ts            #   Vibrancy Index AuthoritativeData, NSR service data, InitiativeSources
    grants.ts          #   fully-specified Grants (award/requirements/guidance/timeline)
    analyses.ts        #   DatumAnalysis, writing & reporting GrantAnalyses
    initiatives.ts     #   the current org + network orgs, with grantRecords Maps
    presentation.ts    #   display metadata (names, colors, copy) keyed by domain id
    index.ts           #   wires the Grant⇄Initiative edge; exports `seed`
  lib/                 # format helpers, grant view-model selectors, flow content
  state/store.tsx      # app state: routing, lifecycle stages, discoverable, tracking, answers, modals
  theme.ts             # design tokens & style helpers
  components/          # icons, UI primitives, TopNav, Modals
  pages/               # one component per screen
```

## The data population, mapped to the types

The seed data exercises the whole domain model, unchanged:

- **`Initiative`** — `currentOrg` (Riverside Greenway Project) + 6 network orgs, each with a
  `grantRecords: Map<string, GrantRecord>`, `serviceAreas`, `issues`, `averageAnnualBudget`,
  and `sources`.
- **`GrantRecord` / `GrantLifecycleStage`** — the current org spans the full lifecycle:
  `Applied` (×2), `Awarded`, `Saved` (×3), `NotSaved`, and a terminal `NotAwarded`.
- **`Grant`** — 8 grants with complete `award`, `requirements` (eligibility/application/awardee/
  reporting), `guidance`, and `timeline`; `collabOpportunitySubscribers` wired to real Initiatives.
- **`Datum`** — all three variants: `AuthoritativeDatum` (Vibrancy Index metrics with
  min/avg/max context, rendered as the sidebar bar charts), `NSRServiceDatum` (BMS/AIS/OAT),
  and `InitiativeDatum` sourced from `WebpageSource` / `DocumentSource` / `ChatSource`.
- **`GrantAnalysis`** — `GrantWritingAnalysis` and `GrantReportingAnalysis` (with a
  `GrantReportingConversation`), each composed of `DatumAnalysis` items whose `understand` /
  `apply` results drive the Flow prefills and the Grant Detail evidence.
- **`Region` / `Location` / `GeoPolygon`** — Pittsburgh neighborhoods and county boundaries.

## The one intentional edit to `types/`

`types/constants.ts` shipped with **empty placeholder arrays** (`ISSUES = [/* ... */]`,
`GRANTORS = [/* ... */]`). Because `Issue`/`Grantor` are derived as `(typeof ARRAY)[number]`,
leaving them empty makes both types resolve to `never`, which makes the whole model impossible to
populate. Filling those two `as const` value arrays is exactly the intended "population" step and
**does not change any type's shape** — `Issue` and `Grantor` are still
`(typeof ISSUES)[number]` / `(typeof GRANTORS)[number]`. No other file in `types/` was touched.

## Notes

- `gemini.ts` and `examples/` are carried over verbatim from the ZIP for structural fidelity; they
  target a server-side `@google/genai` flow and are not part of the front-end build (the app
  `tsconfig` compiles only `src/` and `types/`).
- Two-space `AuthoritativeDatum.location` caveat: in the provided types that field has no import
  and therefore resolves to the DOM global `Location`. The types are kept as-is; `src/data/data.ts`
  bridges geographic locations through `asDatumLocation` / `readDatumLocation`.
