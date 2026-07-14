import "server-only";

import path from "node:path";
import { readFileSync } from "node:fs";
import { GoogleGenAI } from "@google/genai";
import Grant from "@/types/grant";
import Initiative from "@/types/initiative";

/**
 * Defines the tasks that this tool performs using artificial intelligence.
 */
export enum AIIntegration {
  GrantIngestion = "grantIngestion",
  ReportSuggestions = "reportSuggestions",
  ReportConversation = "reportConversation",
}

const AI_DIR = path.join(process.cwd(), "src", "ai");
const INSTRUCTIONS = new Map<string, { prompt: string; schema: unknown }>();

for (const integration in AIIntegration) {
  INSTRUCTIONS.set(integration, {
    prompt: readFileSync(path.join(AI_DIR, integration + ".md"), "utf-8"),
    schema: JSON.parse(
      readFileSync(path.join(AI_DIR, integration + ".json"), "utf-8"),
    ),
  });
}

function getAI() {
  return new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
}

export type GrantIngestionResponse = {
  details?: {
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
};

/**
 * Determines whether the specified URL is a listing for a single, specific
 * grant opportunity, and, if so, extracts a set of details about it from the
 * content of that listing and any relevant webpages linked within it.
 *
 * **This function leverages artificial intelligence.**
 *
 * @param url the URL of the potential grant opportunity
 * @returns the extracted details if the URL is in fact a listing for a
 * single, specific grant opportunity; an empty object otherwise
 * @see {@link GrantIngestionResponse}
 */
export async function ingestGrant(
  url: string,
): Promise<GrantIngestionResponse> {
  const ai = getAI();
  const instructions = INSTRUCTIONS.get(AIIntegration.GrantIngestion);
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

  return JSON.parse(response.text ?? "{}") as GrantIngestionResponse;
}

export type InitialReportSuggestionsResponse = {
  suggestions: number[];
};

/**
 * TODO
 * @param grant the Grant
 * @param initiative
 * @param questionIndex
 * @returns
 */
export async function generateInitialReportSuggestions(
  grant: Grant,
  initiative: Initiative,
  questionIndex: number,
) {
  const ai = getAI();
  const instructions = INSTRUCTIONS.get(AIIntegration.ReportSuggestions);
  const response = await ai.models.generateContent({
    model: "gemini-3.5-flash",
    contents: instructions!.prompt
      .replace(/<0>/gi, grant.requirements.reporting[questionIndex].question)
      .replace(/<1>/gi, "") // TODO: Inject grant details
      .replace(/<2>/gi, ""), // TODO: Inject all global data and Initiative-specific data
    config: {
      enableEnhancedCivicAnswers: true,
      responseMimeType: "application/json",
      responseSchema: instructions!.schema,
      thinkingConfig: {
        includeThoughts: true,
      },
    },
  });

  return JSON.parse(response.text ?? "{}") as InitialReportSuggestionsResponse;
}

export type ReportConversationResponse = {
  message: string;
  suggestions: number[];
  is_sufficient: boolean;
};

/**
 * TODO
 * @param grant
 * @param initiative
 * @param questionIndex
 * @returns
 */
export async function generateReportConversationTurn(
  grant: Grant,
  initiative: Initiative,
  questionIndex: number,
) {
  const ai = getAI();
  const instructions = INSTRUCTIONS.get(AIIntegration.ReportConversation);
  const response = await ai.models.generateContent({
    model: "gemini-3.5-flash",
    contents: instructions!.prompt
      .replace(/<0>/gi, grant.requirements.reporting[questionIndex].question)
      .replace(/<1>/gi, "") // TODO: Inject grant details
      .replace(/<2>/gi, ""), // TODO: Inject all global data and Initiative-specific data
    config: {
      enableEnhancedCivicAnswers: true,
      responseMimeType: "application/json",
      responseSchema: instructions!.schema,
      thinkingConfig: {
        includeThoughts: true,
      },
    },
  });

  return JSON.parse(response.text ?? "{}") as InitialReportSuggestionsResponse;
}
