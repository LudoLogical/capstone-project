import { GoogleGenAI, ThinkingLevel, ContentListUnion } from "@google/genai";

function getAI() {
  return new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
}

export async function generateZeroShotContent(
  prompt: ContentListUnion,
  responseSchema?: unknown,
  maxOutputTokens?: number,
  thinkingLevel?: ThinkingLevel,
): Promise<ContentListUnion> {
  return generateContentWrapper(
    prompt,
    undefined,
    responseSchema,
    maxOutputTokens,
    thinkingLevel,
  );
}

export async function generateConversationalContent(
  systemPrompt: string,
  context: ContentListUnion,
  responseSchema?: unknown,
  maxOutputTokens?: number,
  thinkingLevel?: ThinkingLevel,
) {
  return generateContentWrapper(
    context,
    systemPrompt,
    responseSchema,
    maxOutputTokens,
    thinkingLevel,
  );
}

export async function generateContentWrapper(
  context: ContentListUnion,
  systemPrompt?: string,
  responseSchema?: unknown,
  maxOutputTokens?: number,
  thinkingLevel?: ThinkingLevel,
): Promise<ContentListUnion> {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: "gemini-3.5-flash",
    contents: context,
    config: {
      enableEnhancedCivicAnswers: true,
      maxOutputTokens: maxOutputTokens,
      responseMimeType: "application/json",
      responseSchema: responseSchema,
      thinkingConfig: { thinkingLevel },
    },
  });

  return JSON.parse(response.text || "[]");
}
