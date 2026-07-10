import path from "node:path";
import { readFileSync } from "node:fs";
import { GoogleGenAI } from "@google/genai";

function getAI() {
  return new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
}

const PROMPT_FILE = path.resolve(import.meta.dirname, "./grantIngestion.md");
const PROMPT = readFileSync(PROMPT_FILE, "utf-8");

const SCHEMA_FILE = path.resolve(import.meta.dirname, "./grantIngestion.json");
const SCHEMA = JSON.parse(readFileSync(SCHEMA_FILE, "utf-8"));

export async function ingestGrant(url: string) {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: "gemini-3.5-flash",
    contents: PROMPT.replace(/<0>/gi, url),
    config: {
      enableEnhancedCivicAnswers: true,
      responseMimeType: "application/json",
      responseSchema: SCHEMA,
      thinkingConfig: {
        includeThoughts: true,
      },
      tools: [{ urlContext: {} }, { googleSearch: {} }],
    },
  });

  return response;
}
