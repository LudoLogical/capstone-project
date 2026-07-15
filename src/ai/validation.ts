import { AIFailureReason } from "@/types/ai";
import { GenerateContentResponse, FinishReason } from "@google/genai";

/**
 * A helper function for validateAIResponse() that checks
 * the underlying HTTP response object.
 * @internal
 * @param response the return value of the generateContent() invocation being verified
 * @returns an AIFailureReason if and only if the underlying HTTP respones
 *          was unsuccessful; nothing otherwise
 */
function _validateAIResponseHTTP(
  response: GenerateContentResponse,
): AIFailureReason | void {
  if (
    response.sdkHttpResponse &&
    !response.sdkHttpResponse.responseInternal.ok
  ) {
    return {
      http: {
        status: response.sdkHttpResponse.responseInternal.status,
        message: response.sdkHttpResponse.responseInternal.statusText,
      },
    };
  }
}

/**
 * Verifies that a generateContent() invocation completed successfully.
 * @param response the return value of the generateContent() invocation to be verified
 * @returns an AIFailureReason if and only if a problem occurred;
 *          nothing otherwise
 */
export default function validateAIResponse(
  response: GenerateContentResponse,
): AIFailureReason | void {
  if (!response.candidates) {
    if (response.promptFeedback?.blockReason) {
      return {
        blocked: {
          reason: response.promptFeedback.blockReason,
          message: response.promptFeedback.blockReasonMessage,
        },
      };
    }
    return _validateAIResponseHTTP(response) ?? { unknown: true };
  } else if (
    response.candidates[0].finishReason &&
    response.candidates[0].finishReason !== FinishReason.STOP
  ) {
    return {
      halted: {
        reason: response.candidates[0].finishReason,
        message: response.candidates[0].finishMessage,
      },
    };
  } else if (!response.candidates[0].content) {
    return _validateAIResponseHTTP(response) ?? { unknown: true };
  }
  return _validateAIResponseHTTP(response);
}
