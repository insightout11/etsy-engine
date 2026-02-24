/**
 * Normalize a string: lowercase, remove punctuation, collapse whitespace.
 */
export function normalise(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Tokenize a normalized string into an array of words.
 */
export function tokenise(s: string): string[] {
  return normalise(s).split(" ").filter((t) => t.length > 1);
}

/**
 * Generate n-grams from a token array.
 */
export function ngrams(tokens: string[], n: number): string[] {
  if (tokens.length < n) return [];
  const result: string[] = [];
  for (let i = 0; i <= tokens.length - n; i++) {
    result.push(tokens.slice(i, i + n).join(" "));
  }
  return result;
}

/**
 * Slugify a string for use in filenames.
 */
export function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

// Common English stop words to exclude from phrase analysis
export const STOP_WORDS = new Set([
  "a", "an", "the", "and", "or", "but", "in", "on", "at", "to", "for",
  "of", "with", "by", "from", "is", "are", "was", "were", "be", "been",
  "being", "have", "has", "had", "do", "does", "did", "will", "would",
  "could", "should", "may", "might", "shall", "can", "need", "dare",
  "it", "its", "this", "that", "these", "those", "i", "you", "he",
  "she", "we", "they", "me", "him", "her", "us", "them", "my", "your",
  "his", "our", "their", "what", "which", "who", "whom", "when", "where",
  "why", "how", "all", "each", "both", "few", "more", "most", "other",
  "some", "such", "no", "nor", "not", "only", "own", "same", "so",
  "than", "too", "very", "just", "as", "up", "about", "into", "through",
  "during", "before", "after", "above", "below", "between", "out", "off",
  "over", "under", "again", "then", "once", "here", "there", "any", "am",
]);
