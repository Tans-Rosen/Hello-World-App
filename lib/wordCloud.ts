export const TOP_N = 300;

export const STOPWORDS = new Set([
  "the", "a", "an", "and", "or", "but", "to", "of", "in", "on", "for", "with",
  "is", "are", "was", "were", "be", "been", "being",
  "it", "this", "that", "these", "those",
  "i", "you", "we", "they", "he", "she", "them",
  "my", "your", "our", "their",
]);

export type WordCount = { word: string; count: number };

function normalizeWord(raw: string): string {
  return raw
    .toLowerCase()
    .replace(/[^\w\s]/g, "")
    .trim();
}

export function buildWordCloudData(captions: string[]): WordCount[] {
  const freq: Record<string, number> = {};
  const allText = captions.join(" ");
  const tokens = allText.split(/\s+/).map(normalizeWord).filter(Boolean);

  for (const token of tokens) {
    if (token.length < 3 || STOPWORDS.has(token)) continue;
    freq[token] = (freq[token] ?? 0) + 1;
  }

  return Object.entries(freq)
    .map(([word, count]) => ({ word, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, TOP_N);
}

export const WORD_CLOUD_COLORS = [
  "#1a1a1a",
  "#b22222",
  "#c45c26",
  "#6b4423",
  "#1a4d8c",
  "#2d5a27",
  "#5a3d7a",
  "#0d6b5c",
];
