import type { DifferentiationBrief } from "@/types/brief";
import type { SignalsResult } from "@/types/signals";
import type { ScanOptions } from "@/types/scan";
import { MockLLMProvider } from "./mock-provider";
import { GeminiProvider } from "./gemini-provider";

export interface LLMClientInterface {
  generateBrief(
    signals: SignalsResult,
    scanId: number,
    options: ScanOptions
  ): Promise<DifferentiationBrief>;
}

export function getLLMClient(): LLMClientInterface {
  const provider = process.env.LLM_PROVIDER ?? "mock";

  if (provider === "gemini") {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error(
        "LLM_PROVIDER=gemini but GEMINI_API_KEY is not set. Add it to .env.local"
      );
    }
    return new GeminiProvider(apiKey) as unknown as LLMClientInterface;
  }

  // Default: mock provider
  return {
    generateBrief: (signals, scanId, options) => {
      const mock = new MockLLMProvider();
      void options; // mock doesn't need options but interface requires it
      return mock.generateBrief(signals, scanId);
    },
  };
}
