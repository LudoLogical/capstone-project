import type Initiative from "../../types/initiative";
import type Grant from "../../types/grant";
import { GRANTS } from "./grants";
import {
  currentOrg,
  networkOrgs,
  hilltopUrbanFarm,
  braddockGrows,
  homewoodHarvest,
  cleanAirCoalition,
} from "./initiatives";

/**
 * Wire the mutually-referential edge between Grant and Initiative:
 * `Grant.collabOpportunitySubscribers`. Grants are created first with an empty
 * subscriber list; here we fill in the NSR members who opted in for each grant.
 */
GRANTS.heinzFreshFood.collabOpportunitySubscribers = [homewoodHarvest, hilltopUrbanFarm];
GRANTS.growPittsburgh.collabOpportunitySubscribers = [hilltopUrbanFarm];
GRANTS.poiseEquityFood.collabOpportunitySubscribers = [braddockGrows, homewoodHarvest];
GRANTS.hillmanCleanAir.collabOpportunitySubscribers = [cleanAirCoalition];

export const allInitiatives: Initiative[] = [currentOrg, ...networkOrgs];
export const grantsList: Grant[] = Object.values(GRANTS);

export const seed = {
  currentOrg,
  networkOrgs,
  allInitiatives,
  grants: GRANTS,
  grantsList,
};

export { GRANTS } from "./grants";
export type { GrantKey } from "./grants";
export { currentOrg, networkOrgs } from "./initiatives";
export * from "./presentation";
export { readDatumLocation, asDatumLocation } from "./data";
