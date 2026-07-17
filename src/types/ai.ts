import { BlockedReason, FinishReason } from "@google/genai";

/**
 * A reason why a particular attempt to perform a task using artificial
 * intelligence was unsuccessful. Every instance of this type must define
 * exactly one of its immediate child properties.
 *
 * @remarks
 * For user-initiated (i.e., interactive) invocations of functions that
 * leverage artificial intelligence, consider surfacing explanations for
 * the following AIFailureReasons in the UI.
 *
 * Group 1
 *
 * - BlockedReason.SAFETY
 * - BlockedReason.PROHIBITED_CONTENT
 * - FinishReason.SAFETY
 * - FinishReason.PROHIBITED_CONTENT
 *
 * Group 2
 *
 * - FinishReason.SPII
 *
 * Group 3
 *
 * - FinishReason.MAX_TOKENS
 *
 * Group 4
 *
 * - HTTP 403 PERMISSION_DENIED
 * - HTTP 429 RESOURCE_EXHAUSTED
 *
 * Group 5
 *
 * - HTTP 500 INTERNAL
 * - HTTP 503 UNAVAILABLE
 * - HTTP 504 DEADLINE_EXCEEDED
 */
export type AIFailureReason = {
  /**
   * If present, indicates that this AIFailureReason describes a situation
   * in which a prompt was blocked and contains the applicable details.
   */
  blocked?: {
    /**
     * The specific reason why the prompt from the request associated with
     * this AIFailureReason was blocked.
     */
    reason: BlockedReason;

    /**
     * A readable description of why the prompt from the request associated
     * with this AIFailureReason was blocked.
     */
    message?: string;
  };

  /**
   * If present, indicates that this AIFailureReason describes a situation
   * in which content generation halted prematurely and contains the
   * applicable details.
   */
  halted?: {
    /**
     * The specific reason why the content generation associated with this
     * AIFailureReason halted prematurely.
     */
    reason: FinishReason;

    /**
     * A readable description of why the content generation associated with
     * this AIFailureReason halted prematurely.
     */
    message?: string;
  };

  /**
   * If present, indicates that this AIFailureReason describes a situation
   * in which an underlying HTTP response was unsuccessful and contains the
   * applicable details.
   */
  http?: {
    /**
     * The HTTP status code of the unsuccessful HTTP response associated
     * with this AIFailureReason.
     */
    status: number;

    /**
     * The status message from the unsuccessful HTTP response associated
     * with this AIFailureReason.
     */
    message: string;
  };

  /**
   * If present, indicates that this AIFailureReason could not be
   * precisely defined.
   */
  unknown?: true;
};
