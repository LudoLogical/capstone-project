import { Type } from "@google/genai";

type SchemaAsTypeScriptType = {
  id: string;
  name: string;
  role?: string;
  traits: string[];
  needs: {
    id: string;
    description: string;
    priority: "High" | "Medium" | "Low";
  }[]; // Note the square brackets - they mean that the property `needs` is an ARRAY of these objects!
};

const schemaAsOpenAPIObject = {
  type: Type.OBJECT,
  properties: {
    id: { type: Type.STRING },
    name: { type: Type.STRING },
    role: { type: Type.STRING },
    traits: { type: Type.ARRAY, items: { type: Type.STRING } },
    needs: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          description: { type: Type.STRING },
          priority: {
            type: Type.STRING,
            enum: ["High", "Medium", "Low"],
          },
        },
        required: ["id", "description", "priority"],
      },
    },
  },
  required: ["id", "name", "traits", "needs"],
};
