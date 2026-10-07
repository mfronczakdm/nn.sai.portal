/**
 * Demo preferences for KnowledgeListing (Recently Viewed / Favorites).
 * Persisted in localStorage for the PKM agent experience.
 */

const FAVORITES_KEY = 'pkm.knowledge.favorites';
const RECENT_KEY = 'pkm.knowledge.recentlyViewed';
const MAX_RECENT = 40;

export const KNOWLEDGE_PREFERENCES_CHANGE_EVENT = 'pkm:knowledge-preferences-change';

function canUseStorage(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function readIds(key: string): string[] {
  if (!canUseStorage()) return [];
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((id): id is string => typeof id === 'string' && id.length > 0);
  } catch {
    return [];
  }
}

function writeIds(key: string, ids: string[]): void {
  if (!canUseStorage()) return;
  try {
    window.localStorage.setItem(key, JSON.stringify(ids));
    window.dispatchEvent(new CustomEvent(KNOWLEDGE_PREFERENCES_CHANGE_EVENT));
  } catch {
    // quota / private mode — ignore
  }
}

function normalizeId(id: string): string {
  return id.replace(/[{}]/g, '').toLowerCase();
}

export function getFavoriteArticleIds(): string[] {
  return readIds(FAVORITES_KEY);
}

export function isFavoriteArticle(id: string): boolean {
  const needle = normalizeId(id);
  return getFavoriteArticleIds().some((x) => normalizeId(x) === needle);
}

export function toggleFavoriteArticle(id: string): boolean {
  const needle = normalizeId(id);
  const current = getFavoriteArticleIds();
  const exists = current.some((x) => normalizeId(x) === needle);
  const next = exists
    ? current.filter((x) => normalizeId(x) !== needle)
    : [id, ...current.filter((x) => normalizeId(x) !== needle)];
  writeIds(FAVORITES_KEY, next);
  return !exists;
}

export function getRecentlyViewedArticleIds(): string[] {
  return readIds(RECENT_KEY);
}

/** Record a Knowledge Article visit (most recent first). */
export function recordArticleView(id: string): void {
  if (!id) return;
  const needle = normalizeId(id);
  const next = [id, ...getRecentlyViewedArticleIds().filter((x) => normalizeId(x) !== needle)].slice(
    0,
    MAX_RECENT
  );
  writeIds(RECENT_KEY, next);
}
