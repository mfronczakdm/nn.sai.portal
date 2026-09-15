import { getClientId } from '@sitecore-content-sdk/analytics-core';
import {
  CLIENT_ID_COOKIE_NAME,
  COOKIE_NAME_PREFIX,
  getAnalyticsPlugin,
} from '@sitecore-content-sdk/analytics-core/internal';
import { getPersonalizePlugin } from '@sitecore-content-sdk/personalize/internal';
import { identity } from '@sitecore-content-sdk/events';
import config from 'sitecore.config';

import { getPersonaCode, type DemoUserTaxonomy } from '@/lib/demo-taxonomy';
import { isCdpAnalyticsEnabled } from '@/lib/cdp-analytics';
import { getDemoPersonaProfile } from '@/lib/demo-persona-profiles';

const ANALYTICS_COOKIE_NAMES = [
  `${COOKIE_NAME_PREFIX}${CLIENT_ID_COOKIE_NAME}`,
  `${COOKIE_NAME_PREFIX}${CLIENT_ID_COOKIE_NAME}_personalize`,
] as const;

const ANALYTICS_SDK_POLL_MS = 50;
const ANALYTICS_SDK_TIMEOUT_MS = 15000;
const ANALYTICS_CLIENT_ID_TIMEOUT_MS = 10000;

export const isDemoAnalyticsEnabled = isCdpAnalyticsEnabled;

function getAnalyticsCookieDomain(): string | undefined {
  if (typeof window === 'undefined') return undefined;

  try {
    return getAnalyticsPlugin().options.cookies.domain;
  } catch {
    return window.location.hostname.replace(/^www\./, '');
  }
}

function deleteBrowserCookie(cookieName: string, cookieDomain?: string): void {
  if (typeof document === 'undefined') return;

  const hostname = window.location.hostname.replace(/^www\./, '');
  const domains = Array.from(
    new Set([cookieDomain, hostname, cookieDomain ? `.${cookieDomain}` : undefined, `.${hostname}`, undefined])
  );

  for (const domain of domains) {
    const domainPart = domain ? `; domain=${domain}` : '';
    document.cookie = `${cookieName}=; Path=/; Max-Age=0; Secure; SameSite=None${domainPart}`;
  }
}

function getLegacyAnalyticsCookieNames(): string[] {
  const contextId = config.api.edge?.clientContextId;
  if (!contextId) return [];

  return [`${COOKIE_NAME_PREFIX}${contextId}`, `${COOKIE_NAME_PREFIX}${contextId}_personalize`];
}

export function clearAnalyticsCookies(): void {
  const cookieDomain = getAnalyticsCookieDomain();

  for (const cookieName of [...ANALYTICS_COOKIE_NAMES, ...getLegacyAnalyticsCookieNames()]) {
    deleteBrowserCookie(cookieName, cookieDomain);
  }
}

async function wait(ms: number): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

export async function waitForAnalyticsSdk(timeoutMs = ANALYTICS_SDK_TIMEOUT_MS): Promise<boolean> {
  const deadline = Date.now() + timeoutMs;

  while (Date.now() < deadline) {
    if (typeof window !== 'undefined' && window.scContentSDK?.analytics_core) {
      return true;
    }

    await wait(ANALYTICS_SDK_POLL_MS);
  }

  return false;
}

export async function waitForAnalyticsClientId(timeoutMs = ANALYTICS_CLIENT_ID_TIMEOUT_MS): Promise<string | null> {
  const deadline = Date.now() + timeoutMs;

  while (Date.now() < deadline) {
    const clientId = getClientId();
    if (clientId) return clientId;

    await wait(ANALYTICS_SDK_POLL_MS);
  }

  return null;
}

function logDemoAnalytics(message: string, details?: Record<string, unknown>): void {
  if (process.env.NEXT_PUBLIC_DEMO_ANALYTICS_DEBUG !== 'true') return;

  if (details) {
    console.info(`[DemoPersonaAnalytics] ${message}`, details);
    return;
  }

  console.info(`[DemoPersonaAnalytics] ${message}`);
}

export async function resetAnalyticsSession(): Promise<string> {
  clearAnalyticsCookies();

  const analyticsPlugin = getAnalyticsPlugin();
  analyticsPlugin.options.visitorIds = undefined;
  await analyticsPlugin.adapter.setClientId();

  const clientId = await waitForAnalyticsClientId();
  if (!clientId) {
    throw new Error('Analytics client ID was not available after session reset');
  }

  try {
    await getPersonalizePlugin().adapter.setProfileId();
  } catch {
    // Personalize plugin is optional; profile ID cookie is best-effort.
  }

  return clientId;
}

export async function identifyDemoPersona(
  persona: DemoUserTaxonomy,
  options?: { resetSession?: boolean }
): Promise<void> {
  if (!isDemoAnalyticsEnabled()) return;

  if (!(await waitForAnalyticsSdk())) {
    console.warn('[DemoPersonaAnalytics] SDK not ready; identity was skipped');
    return;
  }

  try {
    let clientId: string | null = getClientId();

    if (options?.resetSession !== false) {
      clientId = await resetAnalyticsSession();
      logDemoAnalytics('Analytics session reset', { clientId });
    } else if (!clientId) {
      clientId = await waitForAnalyticsClientId();
    }

    if (!clientId) {
      console.warn('[DemoPersonaAnalytics] Missing analytics client ID; identity was skipped');
      return;
    }

    const profile = getDemoPersonaProfile(persona);

    const response = await identity({
      channel: 'WEB',
      currency: 'USD',
      firstName: profile.firstName,
      lastName: profile.lastName,
      email: profile.email,
      identifiers: [
        {
          id: profile.email,
          provider: 'email',
        },
      ],
      extensionData: {
        demoPersona: persona,
        demoPersonaCode: getPersonaCode(persona),
        demoPersonaId: profile.identifierId,
      },
    });

    if (!response) {
      console.warn('[DemoPersonaAnalytics] Identity event failed to send', {
        persona,
        clientId,
        email: profile.email,
      });
      return;
    }

    logDemoAnalytics('Identity event sent', {
      persona,
      clientId,
      email: profile.email,
      identifierId: profile.identifierId,
    });
  } catch (error) {
    console.warn('[DemoPersonaAnalytics] Identity flow failed', { persona, error });
  }
}

export async function resetDemoPersonaAnalyticsSession(): Promise<void> {
  if (!isDemoAnalyticsEnabled()) return;

  if (!(await waitForAnalyticsSdk())) {
    console.warn('[DemoPersonaAnalytics] SDK not ready; session reset was skipped');
    return;
  }

  try {
    const clientId = await resetAnalyticsSession();
    logDemoAnalytics('Anonymous analytics session restored', { clientId });
  } catch (error) {
    console.warn('[DemoPersonaAnalytics] Session reset failed', { error });
  }
}
