import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { scoreCandidate } from "@/modules/keyword-queue/score-candidate";
import { CandidateScoreSchema } from "@/contracts/keyword-candidate";

// No module mocks — exercises the real fixture loading + computeSignals pipeline

const savedApiKey = process.env.ETSY_API_KEY;
const savedAccessToken = process.env.ETSY_ACCESS_TOKEN;

beforeEach(() => {
  // Remove real creds so fixture mode activates automatically
  delete process.env.ETSY_API_KEY;
  delete process.env.ETSY_ACCESS_TOKEN;
  delete process.env.ETSY_FIXTURE_MODE;
});

afterEach(() => {
  if (savedApiKey !== undefined) process.env.ETSY_API_KEY = savedApiKey;
  if (savedAccessToken !== undefined) process.env.ETSY_ACCESS_TOKEN = savedAccessToken;
  delete process.env.ETSY_FIXTURE_MODE;
});

describe("scoreCandidate — fixture mode", () => {
  it("uses fixture data when Etsy credentials are absent", async () => {
    const score = await scoreCandidate("wedding planner printable");
    // Fixture has 50 listings — confirms real data was loaded, not empty mock
    expect(score.listingCount).toBeGreaterThan(0);
    expect(score.composite).toBeGreaterThanOrEqual(0);
    expect(score.composite).toBeLessThanOrEqual(100);
    expect(() => CandidateScoreSchema.parse(score)).not.toThrow();
  });

  it("returns valid CandidateScore when ETSY_FIXTURE_MODE=1 is set", async () => {
    // Restore creds to prove the env flag alone forces fixture mode
    process.env.ETSY_API_KEY = "fake-key";
    process.env.ETSY_ACCESS_TOKEN = "fake-token";
    process.env.ETSY_FIXTURE_MODE = "1";

    const score = await scoreCandidate("budget tracker template");
    expect(score.listingCount).toBeGreaterThan(0);
    expect(score.composite).toBeGreaterThanOrEqual(0);
    expect(score.composite).toBeLessThanOrEqual(100);
    expect(() => CandidateScoreSchema.parse(score)).not.toThrow();
  });
});
