/**
 * Sitecore Search (legacy JS SDK) widget IDs and defaults.
 * Override via NEXT_PUBLIC_* env vars for your Search domain / CEC configuration.
 * @see https://www.npmjs.com/package/@sitecore-search/react
 */

/** CEC customer key format: digits-digits (e.g. 11111-2222222). */
const CUSTOMER_KEY_PATTERN = /^\d+-\d+$/;

const PLACEHOLDER_VALUE_PATTERN = /^(<.*>|your-|changeme|example|todo|xxx)/i;

function isUsableEnvValue(value: string | undefined): value is string {
  if (!value?.trim()) return false;
  return !PLACEHOLDER_VALUE_PATTERN.test(value.trim());
}

/** Preview search widget rfkId (typeahead in header). */
export const PREVIEW_WIDGET_ID =
  process.env.NEXT_PUBLIC_SEARCH_PREVIEW_WIDGET_ID || 'rfkid_6';

/** Full search results widget rfkId. */
export const SEARCH_WIDGET_ID =
  process.env.NEXT_PUBLIC_SEARCH_RESULTS_WIDGET_ID || 'rfkid_7';

/** Homepage highlighted articles widget. */
export const HOMEHIGHLIGHTED_WIDGET_ID =
  process.env.NEXT_PUBLIC_SEARCH_HIGHLIGHT_WIDGET_ID || 'search_home_highlight_articles';

export const HOME_HERO_RFKID = process.env.NEXT_PUBLIC_SEARCH_HOME_HERO_RFKID || 'home_hero';

export const HIGHLIGHTED_ARTICLES_RFKID =
  process.env.NEXT_PUBLIC_SEARCH_HIGHLIGHT_RFKID || 'search_home_highlight_blogs';

export const HIGHLIGHTED_ARTICLES_CONTENT_TYPE =
  process.env.NEXT_PUBLIC_SEARCH_HIGHLIGHT_CONTENT_TYPE || 'Article';

export const DEFAULT_IMG_URL =
  process.env.NEXT_PUBLIC_SEARCH_DEFAULT_IMG_URL ||
  'https://placehold.co/500x300?text=No+Image';

export const DEFAULT_QUESTION =
  process.env.NEXT_PUBLIC_SEARCH_DEFAULT_QUESTION ||
  'What are the shared claim intake standards?';

/**
 * True when Sitecore Search legacy SDK credentials look real enough to initialize WidgetsProvider.
 * Rejects empty values, HTML-style placeholders, and invalid customer keys (must be `\d+-\d+`).
 */
export function isSitecoreSearchConfigured(): boolean {
  const env = process.env.NEXT_PUBLIC_SEARCH_ENV?.trim();
  const customerKey = process.env.NEXT_PUBLIC_SEARCH_CUSTOMER_KEY?.trim();
  const apiKey = process.env.NEXT_PUBLIC_SEARCH_API_KEY?.trim();

  if (!isUsableEnvValue(env) || !isUsableEnvValue(customerKey) || !isUsableEnvValue(apiKey)) {
    return false;
  }

  if (!['prod', 'prodEu', 'apse2'].includes(env)) {
    return false;
  }

  return CUSTOMER_KEY_PATTERN.test(customerKey);
}
