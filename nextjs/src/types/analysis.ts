import { Datum } from "./data";
import { Location, Region } from "./geo";

/**
 * Defined by \@google/gen-ai; see
 * https://googleapis.github.io/js-genai/release_docs/types/types.ContentListUnion.html
 */
type ContentListUnion = undefined;

/**
 * An analysis of a single Datum against a particular Grant-Initiative pair
 * conducted as part of a GrantAnalysis.
 */
export type DatumAnalysis = {
  /**
   * The Datum that is the subject of this DatumAnalysis.
   */
  datum: Datum;

  /**
   * A short explanation of why this Datum was considered relevant to its
   * parent GrantAnalysis, or `null` if the user added it to that
   * GrantAnalysis manually.
   */
  relevance: string | null;

  /**
   * The actual content of this DatumAnalysis.
   *
   * @alpha
   * *The feature associated with this property is currently under review.*
   */
  result: {
    /**
     * An AI-generated explanation of the plain meaning of the Datum that
     * is the subject of this DatumAnalysis, structured as a list of
     * bullet points.
     */
    understand: string[];

    /**
     * One or more suggestions for how the Datum that is the subject of this
     * DatumAnalysis could be integrated into an application or report
     * prepared by the associated Initiative from the associated Grant.
     */
    apply: string[];
  };
};

/**
 * An abstract type that defines the properties shared by all
 * GrantAnalysis variants.
 */
export type BaseGrantAnalysis = {
  /**
   * The Location(s) that are relevant to this GrantAnalysis. (Does not include
   * Locations that are only implicitly relevant because they are present
   * within or more relevant Regions.)
   */
  locations: Location[];

  /**
   * The Region(s) that are relevant to this GrantAnalysis.
   */
  regions: Region[];

  /**
   * The DatumAnalysis instances that comprise this GrantAnalysis.
   */
  data: DatumAnalysis[];
};

/**
 * A GrantAnalysis conducted to help a specific Initiative prepare a
 * quantitatively strong application for a specific Grant.
 */
export type GrantWritingAnalysis = BaseGrantAnalysis;

/**
 * A complete record of a single conversation between an Initiative and an
 * AI system that concerns a single question in a GrantReportingAnalysis
 * data gathering workflow.
 */
export type GrantReportingConversation = {
  /**
   * The unique ID of this GrantReportingConversation.
   */
  id: string;

  /**
   * The actual content of this GrantReportingConversation, including:
   *
   * 1. all of the messages sent by both parties,
   * 2. sets of suggestions concerning how the Initiative involved in this
   *    GrantReportingConversation could address the question being discussed
   *    (one set for each AI-generated response), and
   * 3. sets of Datum instances that the AI system has determined are
   *    sufficient to address the question being discussed (one set for each
   *    AI-generated response, or `null` instead of a set if the AI system
   *    found the Datum instances available to it at the time the response was
   *    generated to be insufficient to address the question being discussed).
   */
  content: ContentListUnion;
};

/**
 * A GrantAnalysis conducted to help a specific Initiative prepare a
 * quantitatively strong report about their use of an award that they have
 * received from a specific Grant.
 */
export type GrantReportingAnalysis = BaseGrantAnalysis & {
  /**
   * The Initiative-AI conversations that comprise the data gathering workflow
   * for this GrantReportingAnalysis.
   */
  conversations: GrantReportingConversation[];
};

/**
 * An analysis of one or more Datum instances considered relevant to a specific
 * Grant that was conducted for and optionally contextualized by information
 * about a specific Initiative.
 */
export type GrantAnalysis = GrantWritingAnalysis | GrantReportingAnalysis;
