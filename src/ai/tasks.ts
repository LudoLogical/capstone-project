import "server-only";

import path from "node:path";
import { readFileSync } from "node:fs";
import { Content, GenerateContentResponse, GoogleGenAI } from "@google/genai";
import Grant, { ReportingRequirement } from "@/types/grant";
import Initiative from "@/types/initiative";
import { AIFailureReason } from "@/types/ai";
import { formatCurrencyFull, formatDate } from "@/utils/format";
import validateAIResponse from "./validation";
import {
  AuthoritativeDatum,
  Datum,
  InitiativeSource,
  InitiativeSourceKind,
  NSRServiceDatum,
} from "@/types/data";
import { Region } from "@/types/geo";
import { INDICATORS } from "@/types/constants";
import {
  getAuthoritativeDatum,
  getCensusTracts,
  getNSRServiceData,
} from "@/data/external";

/**
 * Iff true, verbose details about AI invocations are logged to the console.
 * @internal
 */
const DEBUG = true;

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
 * Logs detailed information about the specified
 * GenerateContentResponse to the console if and only if DEBUG is true.
 * @param response the GenerateContentResponse to log
 * @internal
 */
function logVerboseResponse(response: GenerateContentResponse): void {
  if (DEBUG) {
    console.log("+++ BEGIN VERBOSE RESPONSE LOG +++");
    console.log("--- RAW RESPONSE OBJECT ---\n" + response + "\n");
    if (response.candidates) {
      console.log(
        "--- CONTENT PARTS (x" +
          (response.candidates[0].content?.parts?.length ?? 0) +
          ") ---\n" +
          response +
          "\n",
      );
      for (const part of response.candidates[0].content?.parts ?? []) {
        console.log(part.text ?? part.thoughtSignature);
      }
    }
    console.log("+++ END VERBOSE RESPONSE LOG +++");
  }
}

/**
 * A set of details concerning a single, specific Grant that were extracted
 * by a single invocation of ingestGrant().
 *
 * @see {@link Grant}
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

  logVerboseResponse(response);
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
 * A helper function for _formatReportWorkflowInputData that converts
 * Datum instance arrays to strings in the appropriate format.
 * @param accumulator
 */
function _formatDatumList(data: Datum[]): string {
  return data.reduce(
    (acc, datum) =>
      acc +
      "\nID number: " +
      datum.id +
      "\nDescription: " +
      datum.content +
      "\nSource: " +
      datum.citation +
      "\n",
    "",
  );
}

/**
 * A helper function for multiple AI tasks used in the report data gathering
 * workflow that stringifies all AuthoritativeDatum instance *types*
 * (not the instances themselves because those are geo-specific),
 * all of the specified Initiative's NSRServiceDatum instances, and
 * all of their InitiativeDatum instances for system prompt injection.
 * @internal
 */
async function _formatReportInputData(
  initiative: Initiative,
  grantRegions: Region[],
): Promise<string> {
  // Set used to remove duplicates
  const censusTracts = new Set<Region>([
    ...getCensusTracts(initiative.serviceAreas),
    ...getCensusTracts(grantRegions),
  ]);

  const authoritativeData: AuthoritativeDatum[] = [];
  for (const indicator of INDICATORS) {
    for (const censusTract of censusTracts) {
      authoritativeData.push(getAuthoritativeDatum(indicator, censusTract));
    }
  }

  const nsrServiceData: NSRServiceDatum[] = getNSRServiceData(initiative);
  const initiativeSources: InitiativeSource[] = initiative.sources;

  const maxID = Math.max(
    authoritativeData[authoritativeData.length - 1].id,
    ...nsrServiceData.map((datum) => datum.id),
  );
  let initiativeSourceID = maxID;

  return (
    "## Authoritative data\n" +
    _formatDatumList(authoritativeData) +
    "\n## NSR service data\n" +
    _formatDatumList(nsrServiceData) +
    "\n## Initiative data\n" +
    (await Promise.all(
      initiativeSources
        .map(async (source) => {
          const content =
            source.kind !== InitiativeSourceKind.Document
              ? source.content
              : await source.file.text();
          return (
            "\nID number: " +
            ++initiativeSourceID +
            "\nDescription: " +
            content +
            "\nSource: " +
            initiative.name +
            ", " +
            formatDate(source.creationTime)
          );
        })
        .join("\n") + "\n",
    )) +
    "\n"
  );
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
      .replace(
        /<2>/gi,
        await _formatReportInputData(initiative, grant.targetRegions),
      ),
    config: {
      enableEnhancedCivicAnswers: true,
      responseMimeType: "application/json",
      responseSchema: instructions!.schema,
      thinkingConfig: {
        includeThoughts: DEBUG,
      },
    },
  });

  logVerboseResponse(response);
  return (
    validateAIResponse(response) ??
    (JSON.parse(response.text!).suggestions as number[])
  );
}

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
        includeThoughts: DEBUG,
      },
      systemInstruction: instructions!.prompt
        .replace(/<0>/gi, requirement.question)
        .replace(/<1>/gi, _formatGrantDetails(grant))
        .replace(
          /<2>/gi,
          await _formatReportInputData(initiative, grant.targetRegions),
        ),
    },
  });

  logVerboseResponse(response);
  const aiFailureReason = validateAIResponse(response);
  if (aiFailureReason) {
    return aiFailureReason;
  } else {
    context.push(response.candidates![0].content!);
    return context;
  }
}
