import type { EtsyListing } from "@/types/etsy";
import type { TitleSamenessResult, TopPhrase } from "@/types/signals";
import { normalise, tokenise, ngrams, STOP_WORDS } from "@/lib/utils/text";
import { round } from "@/lib/utils/math";

function buildTfidf(docs: string[][]): Map<string, number>[] {
  const N = docs.length;
  // IDF: log(N / (1 + docs_containing_term))
  const dfMap = new Map<string, number>();
  for (const tokens of docs) {
    Array.from(new Set(tokens)).forEach((t) => {
      dfMap.set(t, (dfMap.get(t) ?? 0) + 1);
    });
  }

  return docs.map((tokens) => {
    const tf = new Map<string, number>();
    for (const t of tokens) {
      tf.set(t, (tf.get(t) ?? 0) + 1);
    }
    const tfidf = new Map<string, number>();
    Array.from(tf.entries()).forEach(([term, count]) => {
      const idf = Math.log(N / (1 + (dfMap.get(term) ?? 0)));
      tfidf.set(term, (count / tokens.length) * idf);
    });
    return tfidf;
  });
}

function cosine(a: Map<string, number>, b: Map<string, number>): number {
  let dot = 0;
  let normA = 0;
  let normB = 0;

  Array.from(a.entries()).forEach(([term, valA]) => {
    normA += valA * valA;
    const valB = b.get(term) ?? 0;
    dot += valA * valB;
  });
  Array.from(b.values()).forEach((valB) => {
    normB += valB * valB;
  });

  const denom = Math.sqrt(normA) * Math.sqrt(normB);
  return denom === 0 ? 0 : dot / denom;
}

export function computeTitleSameness(
  listings: EtsyListing[]
): TitleSamenessResult {
  if (listings.length === 0) {
    return { averageSimilarity: 0, topPhrases: [], clusterCount: 0 };
  }
  if (listings.length === 1) {
    return { averageSimilarity: 1, topPhrases: [], clusterCount: 1 };
  }

  const tokenised = listings.map((l) => tokenise(l.title));
  const tfidfVectors = buildTfidf(tokenised);

  // Pairwise cosine similarity (O(N²), acceptable for N≤100)
  let totalSim = 0;
  let pairs = 0;
  for (let i = 0; i < tfidfVectors.length; i++) {
    for (let j = i + 1; j < tfidfVectors.length; j++) {
      totalSim += cosine(tfidfVectors[i], tfidfVectors[j]);
      pairs++;
    }
  }
  const averageSimilarity = pairs > 0 ? round(totalSim / pairs, 4) : 0;

  // Top phrases: extract bigrams + trigrams from all titles, rank by frequency
  const phraseCount = new Map<string, number>();
  const phraseScore = new Map<string, number>();

  for (let i = 0; i < listings.length; i++) {
    const tokens = tokenised[i].filter((t) => !STOP_WORDS.has(t));
    const phrases = [...ngrams(tokens, 2), ...ngrams(tokens, 3)];
    for (const phrase of phrases) {
      phraseCount.set(phrase, (phraseCount.get(phrase) ?? 0) + 1);
    }
    // Add TF-IDF score contribution
    Array.from(tfidfVectors[i].entries()).forEach(([term, score]) => {
      if (!STOP_WORDS.has(term)) {
        phraseScore.set(term, (phraseScore.get(term) ?? 0) + score);
      }
    });
  }

  const topPhrases: TopPhrase[] = Array.from(phraseCount.entries())
    .filter(([, count]) => count >= 2)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([phrase, count]) => ({
      phrase,
      count,
      score: round(phraseScore.get(phrase) ?? 0, 4),
    }));

  // Approximate cluster count using similarity threshold
  const HIGH_SIM_THRESHOLD = 0.6;
  let clusters = listings.length;
  for (let i = 0; i < tfidfVectors.length; i++) {
    for (let j = i + 1; j < tfidfVectors.length; j++) {
      if (cosine(tfidfVectors[i], tfidfVectors[j]) > HIGH_SIM_THRESHOLD) {
        clusters = Math.max(1, clusters - 1);
        break;
      }
    }
  }

  return { averageSimilarity, topPhrases, clusterCount: clusters };
}
