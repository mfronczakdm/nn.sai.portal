import 'server-only';

export function isMockDataEnabled(): boolean {
  const flag = process.env.USE_MOCK_DATA;
  if (flag === undefined || flag === '') {
    return true;
  }
  return flag.toLowerCase() === 'true' || flag === '1';
}

export function getSitecoreSiteName(): string {
  return process.env.SITECORE_SITE_NAME?.trim() || 'lcmc';
}

export function getSitecoreEndpoint(): string {
  return process.env.SITECORE_GRAPHQL_ENDPOINT?.trim() || '';
}

export function getSitecoreApiKey(): string {
  return process.env.SITECORE_API_KEY?.trim() || '';
}
