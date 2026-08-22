/**
 * Scrunch AXP (AI Experience Platform) — edge bot routing.
 *
 * AI bot traffic is forwarded to Scrunch for optimized HTML. Humans and any
 * Scrunch miss/timeout/error return `null` so the Sitecore proxy chain runs
 * unchanged (locale, preview, multisite, redirects, personalize).
 *
 * Rollback / disable:
 * - Set SCRUNCH_AXP_ENABLED=false, or
 * - Remove the tryScrunchAxp() call from src/proxy.ts, or
 * - Delete this file
 *
 * Required env (when enabled): SCRUNCH_REGION, SCRUNCH_SITE_ID
 */

/** AI bot user-agent substrings (lowercase). */
const AXP_BOT_UA = [
  'googlebot',
  'bingbot',
  'yandexbot',
  'baiduspider',
  'petalbot',
  'applebot',
  'amazonbot',
  'oai-searchbot',
  'perplexitybot',
  'claude-searchbot',
  'chatgpt-user',
  'claude-user',
  'google-agent',
  'perplexity-user',
  'meta-externalfetcher',
  'meta-externalagent',
  'scrunchai-testbot',
  'gptbot',
  'claudebot',
  'ccbot',
  'bytespider',
] as const;

const SCRUNCH_AXP_HOST = 'axp-vercel.scrunch.com';

/** Bound under Vercel’s edge wall-clock so a slow Scrunch hop falls back to origin. */
const FORWARD_TIMEOUT_MS = 5000;

/** AXP diagnostic headers kept on successful Scrunch responses. */
const AXP_HEADERS = [
  'x-axp-version',
  'x-bot-id',
  'x-bot-type',
  'x-error-code',
  'x-debug',
] as const;

function isScrunchEnabled(): boolean {
  if (process.env.SCRUNCH_AXP_ENABLED === 'false') return false;
  return Boolean(process.env.SCRUNCH_REGION?.trim() && process.env.SCRUNCH_SITE_ID?.trim());
}

function isAxBot(userAgent: string): boolean {
  const ua = userAgent.toLowerCase();
  return AXP_BOT_UA.some((bot) => ua.includes(bot));
}

/**
 * @returns Scrunch HTML Response for matching AI bots on cache hit, otherwise `null`
 * so the caller continues into the Sitecore proxy chain.
 */
export async function tryScrunchAxp(request: Request): Promise<Response | null> {
  if (!isScrunchEnabled()) return null;

  const ua = request.headers.get('user-agent') || '';
  if (!isAxBot(ua)) return null;

  const region = process.env.SCRUNCH_REGION!.trim();
  const siteId = process.env.SCRUNCH_SITE_ID!.trim();
  const url = new URL(request.url);
  const scrunchUrl = `https://${SCRUNCH_AXP_HOST}/axp/${region}/${siteId}${url.pathname}${url.search}`;
  const debugToken = request.headers.get('axp-debug-token');

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FORWARD_TIMEOUT_MS);

  try {
    const axp = await fetch(scrunchUrl, {
      headers: {
        'X-Forwarded-Host': url.host,
        'User-Agent': ua,
        ...(debugToken ? { 'axp-debug-token': debugToken } : {}),
      },
      signal: controller.signal,
    });

    if (axp.status !== 200) {
      // Miss / blocked / error → Sitecore origin (unchanged).
      return null;
    }

    // Rebuild with safe headers so decoded body and transfer headers don’t clash.
    const headers = new Headers();
    const contentType = axp.headers.get('content-type');
    const cacheControl = axp.headers.get('cache-control');
    if (contentType) headers.set('content-type', contentType);
    if (cacheControl) headers.set('cache-control', cacheControl);
    for (const name of AXP_HEADERS) {
      const value = axp.headers.get(name);
      if (value) headers.set(name, value);
    }

    return new Response(axp.body, { status: 200, headers });
  } catch {
    // Timeout or network error → Sitecore origin.
    return null;
  } finally {
    clearTimeout(timer);
  }
}
