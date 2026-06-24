import { Issue } from "./constants";
import { DocumentDatum } from "./data";
import { Region } from "./geo";
import GrantRecord from "./grantRecord";

/**
 * An entity that serves a public or social mission and pursues Grants to
 * acquire at least some of its support. Must be either a legally incorporated
 * non-profit organization or a community project that is fiscally sponsored by NSR.
 */
type Initiative = {
  id: string;

  /**
   * The email address at which this Initiative should be contacted regarding
   * shared interest in collaborating on Grants.
   */
  contactEmail: string;

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
