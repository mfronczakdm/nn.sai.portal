import { cooleyPulsePack } from './cooley';
import { matchPulsePackIntent } from './match';
import type { MatchedPulseIntent, PulseSitePack } from './types';

export type { MatchedPulseIntent, PulsePackIntent, PulseSitePack, PulseTypeLabels } from './types';
export { matchPulsePackIntent, normalizePulseQuestion } from './match';

const DEFAULT_PACK_SITE = 'cooley';

/** Registry of Pulse site packs for this starter. */
export const PULSE_SITE_PACKS: Readonly<Record<string, PulseSitePack>> = {
  cooley: cooleyPulsePack,
};

export function normalizePulseSiteName(siteName?: string | null): string {
  return (siteName || '').toLowerCase().trim();
}

/**
 * Resolve a Pulse pack for the current site.
 * Falls back to NEXT_PUBLIC_DEFAULT_SITE_NAME, then cooley.
 */
export function getPulsePack(siteName?: string | null): PulseSitePack {
  const key = normalizePulseSiteName(siteName);
  if (key && PULSE_SITE_PACKS[key]) return PULSE_SITE_PACKS[key];

  const envDefault = normalizePulseSiteName(process.env.NEXT_PUBLIC_DEFAULT_SITE_NAME);
  if (envDefault && PULSE_SITE_PACKS[envDefault]) return PULSE_SITE_PACKS[envDefault];

  return PULSE_SITE_PACKS[DEFAULT_PACK_SITE];
}

export function listPulsePackSiteNames(): string[] {
  return Object.keys(PULSE_SITE_PACKS);
}

export function getPulseStarterPrompts(siteName?: string | null): readonly string[] {
  return getPulsePack(siteName).starterPrompts;
}

export function matchPulseIntentForSite(
  question: string,
  siteName?: string | null
): MatchedPulseIntent | null {
  return matchPulsePackIntent(question, getPulsePack(siteName));
}
