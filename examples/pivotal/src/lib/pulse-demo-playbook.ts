/**
 * @deprecated Prefer `@/lib/pulse-packs`. Thin compatibility shim for Pillsbury demos.
 */
import {
  getPulsePack,
  getPulseStarterPrompts,
  matchPulseIntentForSite,
} from '@/lib/pulse-packs';
import type { PulseSource } from '@/lib/pulse-types';

export type PulseDemoIntentId =
  | 'japan-us-tech-acquisition'
  | 'distressed-portfolio-company'
  | 'saudi-expansion-export-controls'
  | 'mena-trade-sanctions'
  | 'insurance-construction-dispute'
  | 'careers-find-opening';

export function matchPulseDemoIntent(question: string) {
  return matchPulseIntentForSite(question, 'pillsburylaw');
}

/**
 * Build high-confidence sources for a matched demo intent (Pillsbury pack).
 * Prefer Edge hydration via retrievePulseSources; this path uses citationFallbacks only.
 */
export function buildDemoPlaybookSources(question: string): PulseSource[] {
  const intent = matchPulseIntentForSite(question, 'pillsburylaw');
  if (!intent) return [];

  const pack = getPulsePack('pillsburylaw');
  const fallbacks = pack.citationFallbacks || {};

  return intent.citationItemIds
    .map((id, index) => {
      const fallback = fallbacks[id] || fallbacks[id.toUpperCase()];
      if (!fallback) return null;
      return { ...fallback, id, score: 1000 - index * 50 } as PulseSource;
    })
    .filter((s): s is PulseSource => Boolean(s));
}

export const PULSE_DEMO_STARTER_PROMPTS = getPulseStarterPrompts('pillsburylaw');
