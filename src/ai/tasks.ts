import "server-only";

import path from "node:path";
import { readFileSync } from "node:fs";
import { Content, GoogleGenAI } from "@google/genai";
import Grant, { ReportingRequirement } from "@/types/grant";
import Initiative from "@/types/initiative";
import { AIFailureReason } from "@/types/ai";
import validateAIResponse from "./validation";
import { formatCurrencyFull } from "@/utils/format";

const AI_DIR = path.join(process.cwd(), "src", "ai");

function getAI() {
  return new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
}

/**
 * Defines the tasks that this tool performs using artificial intelligence.
 */
export enum AIIntegration {
  GrantIngestion = "grantIngestion",
  ReportSuggestions = "reportSuggestions",
  ReportConversation = "reportConversation",
}

const AI_INSTRUCTIONS = new Map<string, { prompt: string; schema: unknown }>();

for (const integration in AIIntegration) {
  AI_INSTRUCTIONS.set(integration, {
    prompt: readFileSync(path.join(AI_DIR, integration + ".md"), "utf-8"),
    schema: JSON.parse(
      readFileSync(path.join(AI_DIR, integration + ".json"), "utf-8"),
    ),
  });
}

/**
 * A set of details concerning a single, specific Grant that were extracted
 * by a single invocation of ingestGrant().
 */
export type GrantIngestionDetails = {
  name: string;
  purpose: string;
  issues: string[];
  targetRegions: string[];
  awardTerm: number;
  totalMonetaryAward: number;
  annualMonetaryAward: number;
  nonMonetaryBenefits: string[];
  eligibilityRequirements: string[];
  applicationRequirements: string[];
  awardeeRequirements: string[];
  reportingRequirements: {
    asStatements: string[];
    asQuestions: string[];
  };
  applicationWindowStart: string | null;
  applicationWindowEnd: string | null;
  notificationDate: string | null;
  firstReportDeadline: string | null;
  reportFrequency: number;
};

/**
 * Determines whether the specified URL is a listing for a single, specific
 * Grant, and, if so, extracts a set of details about it from the content of
 * that listing and any relevant webpages linked within it.
 *
 * **This function leverages artificial intelligence.**
 *
 * @param url - the URL of the potential Grant listing
 * @returns a {@link GrantIngestionDetails} object if the URL is in fact a
 *          listing for a single, specific Grant, or false if it isn't,
 *          or an AIFailureReason if a problem occured during generation
 *
 * @see {@link AIFailureReason}
 */
export async function ingestGrant(
  url: string,
): Promise<GrantIngestionDetails | false | AIFailureReason> {
  const ai = getAI();
  const instructions = AI_INSTRUCTIONS.get(AIIntegration.GrantIngestion);
  const response = await ai.models.generateContent({
    model: "gemini-3.5-flash",
    contents: instructions!.prompt.replace(/<0>/gi, url),
    config: {
      enableEnhancedCivicAnswers: true,
      responseMimeType: "application/json",
      responseSchema: instructions!.schema,
      thinkingConfig: {
        includeThoughts: true,
      },
      tools: [{ urlContext: {} }, { googleSearch: {} }],
    },
  });
  const aiFailureReason = validateAIResponse(response);
  if (aiFailureReason) {
    return aiFailureReason;
  } else {
    const responseJSON = JSON.parse(response.text!);
    return (responseJSON.details as GrantIngestionDetails) ?? false;
  }
}

/**
 * A helper function for multiple AI tasks used in the report data gathering
 * workflow that stringifies select Grant details for system prompt injection.
 * @internal
 */
function _formatGrantDetails(grant: Grant): string {
  return (
    "Purpose: " +
    grant.purpose +
    "\n" +
    "Issues: " +
    grant.issues.join(", ") +
    "\n" +
    "Target regions: " +
    grant.targetRegions.map((region) => region.name).join(", ") +
    "\n" +
    "Total award amount: " +
    formatCurrencyFull(grant.award.totalAmount) +
    "\n" +
    "Annual award amount: " +
    formatCurrencyFull(grant.award.annualAmount) +
    "\n" +
    "Non-monetary benefits: " +
    (grant.award.benefits.length > 0
      ? "\n- " + grant.award.benefits.join("\n- ")
      : "None")
  );
}

/**
 * A helper function for multiple AI tasks used in the report data gathering
 * workflow that stringifies all AuthoritativeDatum instance *types*
 * (not the instances themselves because those are geo-specific),
 * all of the specified Initiative's NSRServiceDatum instances, and
 * all of their InitiativeDatum instances for system prompt injection.
 * @internal
 * TODO: seek team alignment on AuthoritativeDatum strategy and implement function
 */
function _formatAllAccessibleData(initiative: Initiative): string {
  return "" + initiative;
}

/**
 * Produces a list of zero or more IDs of Datum instances that may help the
 * specified Initiative satisfy the specified ReportingRequirement for the
 * corresponding Grant. If the list contains at least two Datum instance IDs,
 * they will appear in order from most to least promising.
 *
 * **This function leverages artificial intelligence.**
 *
 * @param requirement - the ReportingRequirement that the list of Datum instances should support
 * @param grant - the Grant to which the requirement applies
 * @param initiative - the Initiative for which the list of Datum instances should be generated
 * @returns the sorted list of Datum instance IDs, or an AIFailureReason
 *          if a problem occurred during generation
 *
 * @see {@link AIFailureReason}
 */
export async function generateInitialReportSuggestions(
  requirement: ReportingRequirement,
  grant: Grant,
  initiative: Initiative,
): Promise<number[] | AIFailureReason> {
  const ai = getAI();
  const instructions = AI_INSTRUCTIONS.get(AIIntegration.ReportSuggestions);
  const response = await ai.models.generateContent({
    model: "gemini-3.5-flash",
    contents: instructions!.prompt
      .replace(/<0>/gi, requirement.question)
      .replace(/<1>/gi, _formatGrantDetails(grant))
      .replace(/<2>/gi, _formatAllAccessibleData(initiative)),
    config: {
      enableEnhancedCivicAnswers: true,
      responseMimeType: "application/json",
      responseSchema: instructions!.schema,
      thinkingConfig: {
        includeThoughts: true,
      },
    },
  });

  return (
    validateAIResponse(response) ??
    (JSON.parse(response.text!).suggestions as number[])
  );
}

/**
 * The AI-generated content created by a single invocation of
 * generateReportConversationTurn().
 */
export type ReportConversationResponse = {
  /**
   * The response to the user message.
   */
  message: string;

  /**
   * The sorted list of Datum instance IDs.
   */
  suggestions: number[];

  /**
   * For AI system use only; do not modify.
   * @internal
   * @readonly
   */
  is_sufficient: boolean;
};

/**
 * Responds to a user message from a data gathering workflow conversation for
 * a GrantReportingAnalysis that concerns the specified ReportingRequirement.
 *
 * Also produces a list of zero or more IDs of Datum instances that may help
 * the specified Initiative satisfy the specified ReportingRequirement for the
 * corresponding Grant. If the list contains at least two Datum instance IDs,
 * they will appear in order from most to least promising.
 *
 * **This function leverages artificial intelligence.**
 *
 * @param requirement the ReportingRequirement that the user message concerns and that the list of Datum instances should support
 * @param grant the Grant for which the GrantReportingAnalysis is to be conducted and to which the requirement applies
 * @param initiative the Initiative for which the GrantReportingAnalysis is to be conducted and for which the list of Datum instances should be generated
 * @param message the user message to which the response should be generated
 * @param context the existing content of the data gathering workflow conversation, if any
 * @returns a mutated version of the original context array (or a new one
 * if no context was supplied) appended with both the user message and the
 * generated content (in that order), or an AIFailureReason if a problem
 * occured during generation
 *
 * @see {@link ReportConversationResponse}
 * @see {@link AIFailureReason}
 */
export async function generateReportConversationTurn(
  requirement: ReportingRequirement,
  grant: Grant,
  initiative: Initiative,
  message: string,
  context: Content[] = [],
): Promise<Content[] | AIFailureReason> {
  context.push({
    parts: [{ text: message }],
    role: "user",
  });

  const ai = getAI();
  const instructions = AI_INSTRUCTIONS.get(AIIntegration.ReportConversation);
  const response = await ai.models.generateContent({
    model: "gemini-3.5-flash",
    contents: context,
    config: {
      enableEnhancedCivicAnswers: true,
      responseMimeType: "application/json",
      responseSchema: instructions!.schema,
      thinkingConfig: {
        includeThoughts: true,
      },
      systemInstruction: instructions!.prompt
        .replace(/<0>/gi, requirement.question)
        .replace(/<1>/gi, _formatGrantDetails(grant))
        .replace(/<2>/gi, _formatAllAccessibleData(initiative)),
    },
  });

  const aiFailureReason = validateAIResponse(response);
  if (aiFailureReason) {
    return aiFailureReason;
  } else {
    context.push(response.candidates![0].content!);
    return context;
  }
}
