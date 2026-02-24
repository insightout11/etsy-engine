import { GoogleGenerativeAI } from "@google/generative-ai";
import type { DifferentiationBrief } from "@/types/brief";
import type { SignalsResult } from "@/types/signals";
import type { ScanOptions } from "@/types/scan";
import { DifferentiationBriefSchema } from "./schema";
import { buildPrompt } from "./prompt-builder";

export class GeminiProvider {
  private genAI: GoogleGenerativeAI;

  constructor(apiKey: string) {
    this.genAI = new GoogleGenerativeAI(apiKey);
  }

  async generateBrief(
    signals: SignalsResult,
    scanId: number,
    options: ScanOptions
  ): Promise<DifferentiationBrief> {
    const model = this.genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.3, // lower temperature for consistent structured output
      },
    });

    const { systemPrompt, userMessage } = buildPrompt(signals, scanId, options);

    const result = await model.generateContent({
      systemInstruction: systemPrompt,
      contents: [{ role: "user", parts: [{ text: userMessage }] }],
    });

    const rawText = result.response.text();

    let parsed: unknown;
    try {
      parsed = JSON.parse(rawText);
    } catch (e) {
      const err = new Error(
        `Gemini returned invalid JSON: ${(e as Error).message}`
      );
      (err as Error & { rawOutput: string }).rawOutput = rawText;
      throw err;
    }

    try {
      const validated = DifferentiationBriefSchema.parse(parsed);
      return validated as DifferentiationBrief;
    } catch (e) {
      const err = new Error(
        `Gemini output failed schema validation: ${(e as Error).message}`
      );
      (err as Error & { rawOutput: string }).rawOutput = rawText;
      (err as Error & { parsed: unknown }).parsed = parsed;
      throw err;
    }
  }
}
