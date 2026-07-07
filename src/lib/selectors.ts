import type Grant from "../../types/grant";
import { GRANTS, GRANT_DISPLAY, GRANT_DISPLAY_BY_ID, type GrantKey, type GrantDisplay } from "../data";
import { money, shortDate, relativeDue, periodLabel } from "./format";

export function grantKeyOf(id: string): GrantKey | undefined {
  return (Object.keys(GRANTS) as GrantKey[]).find((k) => GRANTS[k].id === id);
}

export type GrantVM = {
  id: string;
  grant: Grant;
  display: GrantDisplay;
  name: string;
  funder: string;
  funderShort: string;
  amountLabel: string;
  annualLabel: string;
  closesLabel: string;
  closesRelative: string;
  notifyLabel: string;
  issueLabel: string;
  issuesLabel: string;
  locationLabel: string;
  purpose: string;
  periodLabel: string;
};

export function grantVM(grant: Grant): GrantVM {
  const display = GRANT_DISPLAY_BY_ID[grant.id];
  return {
    id: grant.id,
    grant,
    display,
    name: display.name,
    funder: grant.grantor,
    funderShort: display.funderShort,
    amountLabel: money(grant.award.totalAmount),
    annualLabel: money(grant.award.annualAmount) + "/yr",
    closesLabel: shortDate(grant.timeline.applicationWindowEnd),
    closesRelative: relativeDue(grant.timeline.applicationWindowEnd),
    notifyLabel: shortDate(grant.timeline.notificationDate),
    issueLabel: grant.issues[0],
    issuesLabel: grant.issues.join(" · "),
    locationLabel: grant.targetRegions.map((r) => r.name).join(", "),
    purpose: grant.purpose,
    periodLabel: periodLabel(grant.timeline.applicationWindowStart, grant.timeline.awardTerm),
  };
}

export { GRANT_DISPLAY, GRANTS };
