import type { MatchedPulseIntent, PulsePackIntent, PulseSitePack } from './types';

export function normalizePulseQuestion(question: string): string {
  return question
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function matchPulsePackIntent(
  question: string,
  pack: PulseSitePack
): MatchedPulseIntent | null {
  const normalized = normalizePulseQuestion(question);
  if (!normalized) return null;

  let best: PulsePackIntent | null = null;
  let bestScore = 0;

  for (const intent of pack.intents) {
    for (const group of intent.matchAny) {
      if (group.every((token) => normalized.includes(token))) {
        const score = group.length;
        if (score > bestScore) {
          best = intent;
          bestScore = score;
        }
      }
    }
  }

  if (!best) return null;
  return { ...best, packSiteName: pack.siteName };
}
