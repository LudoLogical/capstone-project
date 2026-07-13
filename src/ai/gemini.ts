// Reading GEMINI_API_KEY and the filesystem means this module can only ever run
// on the server. Importing it from a Client Component is a build error, not a
// leaked API key.
import "server-only";

import path from "node:path";
import { readFileSync } from "node:fs";
import { GoogleGenAI } from "@google/genai";

function getAI() {
  return new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
}

// Next bundles server code into .next/server, so `import.meta.dirname` would
// resolve to the bundle directory rather than this source directory. Resolve
// the prompt and schema from the project root instead.
const AI_DIR = path.join(process.cwd(), "src", "ai");

const PROMPT_FILE = path.join(AI_DIR, "grantIngestion.md");
const PROMPT = readFileSync(PROMPT_FILE, "utf-8");

const SCHEMA_FILE = path.join(AI_DIR, "grantIngestion.json");
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
