import { ingestGrant } from "@/ai/gemini";

const testResults = await ingestGrant(
  "https://pittsburghfoundation.org/grant-opps",
);

console.log(testResults);

if (testResults.candidates) {
  console.log(testResults.candidates?.length);
  for (let part of testResults.candidates[0].content?.parts ?? []) {
    console.log(part.text ?? part.thoughtSignature);
  }
}
