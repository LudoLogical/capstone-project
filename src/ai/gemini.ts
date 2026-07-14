import "server-only";

import path from "node:path";
import { readFileSync } from "node:fs";
import { GoogleGenAI } from "@google/genai";
import Grant from "@/types/grant";
import Initiative from "@/types/initiative";

/**
 * TODO
 */
export enum InstructionSet {
  GrantIngestion = "grantIngestion",
  ReportSuggestions = "reportSuggestions",
  ReportConversation = "reportConversation",
}

const AI_DIR = path.join(process.cwd(), "src", "ai");
const INSTRUCTIONS = new Map<string, { prompt: string; schema: unknown }>();

for (const instructionSet in InstructionSet) {
  INSTRUCTIONS.set(instructionSet, {
    prompt: readFileSync(path.join(AI_DIR, instructionSet + ".md"), "utf-8"),
    schema: JSON.parse(
      readFileSync(path.join(AI_DIR, instructionSet + ".json"), "utf-8"),
    ),
  });
}

function getAI() {
  return new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
}

/**
 * TODO
 */
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
 * TODO
 * @param url
 * @returns
 */
export async function ingestGrant(url: string) {
  const ai = getAI();
  const instructions = INSTRUCTIONS.get(InstructionSet.GrantIngestion);
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

/**
 * TODO
 */
export type InitialReportSuggestionsResponse = {
  suggestions: number[];
};

/**
 * TODO
 * @param grant
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
  const instructions = INSTRUCTIONS.get(InstructionSet.ReportSuggestions);
  const response = await ai.models.generateContent({
    model: "gemini-3.5-flash",
    contents: instructions!.prompt
      .replace(/<0>/gi, grant.requirements.reporting.asQuestions[questionIndex])
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

/**
 * TODO
 */
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
  const instructions = INSTRUCTIONS.get(InstructionSet.ReportConversation);
  const response = await ai.models.generateContent({
    model: "gemini-3.5-flash",
    contents: instructions!.prompt
      .replace(/<0>/gi, grant.requirements.reporting.asQuestions[questionIndex])
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
