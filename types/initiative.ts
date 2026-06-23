import { Issue } from "./constants";
import { DocumentDatum } from "./data";
import { Region } from "./geo";
import GrantRecord from "./grantRecord";

/**
 *
 */
type Initiative = {
  id: string;

  /**
   * The set of issues that are related to the work done by this Initiative.
   *
   * Stored as an array instead of a Set to allow users to customize the order
   * in which the issues appear in the UI.
   */
  issues: Issue[];

  /**
   * The geographic area(s) in which this Initiative works.
   */
  serviceAreas: Region[];

  /**
   * A Map containing all of this Initiative's GrantRecords keyed by the
   * corresponding Grant IDs.
   */
  grantRecords: Map<string, GrantRecord>;

  /**
   * This Initiative's average annual budget, computed from BMS data at
   * runtime and cached short-term on the client side.
   */
  averageAnnualBudget: number;

  /**
   * The documents that this Initiative has uploaded to support
   * one or more analyses.
   */
  documents: DocumentDatum[];
};

export default Initiative;
