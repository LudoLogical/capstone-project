/**
 * @module data
 * This module defines two families of types: `Source`s and `Datum` instances.
 *
 * A `Datum` is a single, *specific* piece of information.
 * @example In Census Tract 123, 12% of residents are below the poverty line.
 * @example In 2025, NSR spent a total of $10,000 on renewable energy projects.
 *
 * A `Source` is a database, document, or other point of origin from which a
 * `Datum` might be *extracted*. `Source`s typically contain many possible
 * `Datum` instances, but that is not always the case.
 * @example The United States Census
 * @example NSR's Annual Financial Report for Fiscal Year 2025
 */

import { Indicator, Issue } from "./constants";
import { Region } from "./geo";

/**
 * An abstract type that defines the properties shared by all Datum variants.
 */
export type BaseDatum = {
  /**
   * The unique ID of this Datum.
   */
  id: number;

  /**
   * A short, descriptive statement of this Datum.
   */
  content: string;

  /**
   * A short description of the source from which this Datum originates.
   */
  citation: string;

  /**
   * The method by which this Datum should be visualized.
   *
   * @alpha
   * *The feature associated with this property is currently under review.*
   */
  evaluateMethod: "bar" /* | "other" | "things" | ... */;
};

/**
 * A Datum that originates from the dataset underlying the Vibrancy Index.
 */
export type AuthoritativeDatum = BaseDatum & {
  /**
   * The Vibrancy Index indicator from which this AuthoritativeDatum
   * was derived.
   */
  indicator: Indicator;

  /**
   * The Region (in this case, census tract) that is
   * the subject of this AuthoritativeDatum.
   */
  region: Region;

  /**
   * The quantitative value of this AuthoritativeDatum.
   */
  value: number;

  /**
   * The unit in which the value of this AuthoritativeDatum is expressed.
   */
  unit: string;

  /**
   * A set of basic statistics that illustrate how this AuthoritativeDatum
   * varies across the different Locations for which it exists in the
   * Vibrancy Index dataset.
   */
  context: {
    /**
     * The lowest value that exists for this AuthoritativeDatum across
     * all of the Locations in the Vibrancy Index dataset.
     */
    minimum: number;

    /**
     * The average of the values that exist for this AuthoritativeDatum
     * across all of the Locations in the Vibrancy Index dataset.
     */
    average: number;

    /**
     * The highest value that exists for this AuthoritativeDatum across
     * all of the locations in the Vibrancy Index dataset.
     */
    maximum: number;
  };

  /**
   * The set of issues to which this AuthoritativeDatum is relevant.
   *
   * Stored as an array instead of a Set for consistency with the
   * Initiative type.
   */
  issues: Issue[];

  /**
   * The method by which this AuthoritativeDatum should be visualized.
   *
   * @override
   * An AuthoritativeDatum must be visualized using a bar chart.
   */
  evaluateMethod: "bar";
};

/**
 * A Datum that originates from another service that is
 * operated and managed by NSR.
 *
 * @alpha
 * *The feature associated with this type is currently under review.
 * Outstanding details include an enumeration of the desired inputs, outputs,
 * and evaluateMethods for each NSRServiceDatum that will be supported.*
 */
export type NSRServiceDatum = BaseDatum & {
  /**
   * The NSR service from which this NSRServiceDatum originates.
   */
  service: "BMS" | "AIS" | "OAT";
};

/**
 * Defines the kinds (i.e., subtypes) of InitiativeSources that exist.
 */
export enum InitiativeSourceKind {
  Chat = "CHAT",
  Document = "DOCUMENT",
  Webpage = "WEBPAGE",
}

/**
 * An abstract type that defines the properties shared by
 * all InitiativeSources.
 */
export type BaseInitiativeSource = {
  /**
   * The InitiativeSourceKind of this InitiativeSource.
   */
  kind: InitiativeSourceKind;

  /**
   * The name of the folder into which this InitiativeSource has been
   * organized by the Initiative that uploaded it,
   * or `null` if there is no such folder.
   */
  folder: string | null;

  /**
   * The date and time (in UTC) at which this InitiativeSource was created.
   */
  creationTime: Date;

  /**
   * The ID of the user who uploaded/added this InitiativeSource.
   */
  creator: string;

  /**
   * True if this InitiativeSource has been deleted or is currently
   * marked for deletion; false otherwise.
   */
  isDeleted: boolean;
};

/**
 * An InitiativeSource that an AI system identified in
 * and extracted from a GrantReportingConversation.
 *
 * @remarks
 * ChatSources are unique in that their content is definitionally
 * identical to that of any Datum instances created from them.
 */
export type ChatSource = BaseInitiativeSource & {
  /**
   * @override
   * This InitiativeSource is a ChatSource.
   */
  kind: InitiativeSourceKind.Chat;

  /**
   * A AI-generated statement of this ChatSource.
   *
   * @remarks
   * This approach is preferred over simply referencing the original
   * GrantReportConversation because users are able to delete GrantAnalysis
   * instances without deleting any corresponding ChatSources.
   */
  content: string;
};

/**
 * An InitiativeSource that is a file.
 */
export type DocumentSource = BaseInitiativeSource & {
  /**
   * @override
   * This InitiativeSource is a DocumentSource.
   */
  kind: InitiativeSourceKind.Document;

  /**
   * The file that is this DocumentSource.
   */
  file: File;

  /**
   * The name of this DocumentSource.
   */
  name: string;

  /**
   * The file type of this DocumentSource.
   */
  type: "txt" | "md" | "doc" | "docx" | "csv" | "xlsx" | "ppt" | "pptx" | "pdf";
};

/**
 * A InitiativeSource that is a webpage.
 */
export type WebpageSource = BaseInitiativeSource & {
  /**
   * @override
   * This InitiativeSource is a WebpageSource.
   */
  kind: InitiativeSourceKind.Webpage;

  /**
   * The URL at which this WebpageSource is located.
   */
  link: string;

  /**
   * The HTML content of this WebpageSource.
   *
   * @remarks
   * This content is to be retrieved when this WebpageSource is created,
   * cached in the database, and optionally given a time to live if periodic
   * updates are desired.
   */
  content: string;
};

/**
 * A source of information about an Initiative that was supplied directly to
 * this tool (i.e., not retrieved from another NSR-managed service).
 */
export type InitiativeSource = ChatSource | DocumentSource | WebpageSource;

/**
 * A Datum that originates from an InitiativeSource.
 *
 * @alpha
 * *A feature associated with this type is currently under review.
 * Outstanding details include an enumeration of the evaluateMethod(s) that
 * will be supported and, if there is more than one of them, the strategy/ies
 * that will be employed to determine which one should be applied to a given
 * InitiativeDatum.*
 */
export type InitiativeDatum = BaseDatum & {
  /**
   * The source from which this InitiativeDatum originates.
   */
  source: InitiativeSource;
};

/**
 * A single piece of information that can be relevant to a GrantAnalysis.
 */
export type Datum = AuthoritativeDatum | NSRServiceDatum | InitiativeDatum;
