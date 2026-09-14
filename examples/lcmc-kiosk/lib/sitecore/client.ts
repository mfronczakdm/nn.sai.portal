import 'server-only';

import { readFileSync } from 'fs';
import { join } from 'path';
import { GraphQLClient } from 'graphql-request';

import { SitecoreConfigError } from './errors';
import { getSitecoreApiKey, getSitecoreEndpoint, getSitecoreSiteName } from './env';

/**
 * Server-only GraphQL client for Sitecore Experience Edge.
 * Attaches `sc_apikey` and never imports into Client Components.
 */
export function createSitecoreClient(): GraphQLClient {
  const endpoint = getSitecoreEndpoint();
  const apiKey = getSitecoreApiKey();
  const siteName = getSitecoreSiteName();

  if (!endpoint) {
    throw new SitecoreConfigError('SITECORE_GRAPHQL_ENDPOINT is not set');
  }
  if (!apiKey) {
    throw new SitecoreConfigError('SITECORE_API_KEY is not set');
  }

  return new GraphQLClient(endpoint, {
    headers: {
      sc_apikey: apiKey,
      'x-sitecore-site': siteName,
    },
  });
}

export function loadGraphqlDocument(...filenames: string[]): string {
  const dir = join(process.cwd(), 'lib', 'sitecore', 'queries');
  return filenames
    .map((filename) => readFileSync(join(dir, filename), 'utf8'))
    .join('\n');
}

export const physiciansDocument = () =>
  loadGraphqlDocument('fragments.graphql', 'physicians.graphql');

export const physicianByPathDocument = () =>
  loadGraphqlDocument('fragments.graphql', 'physician-by-path.graphql');

export const locationsDocument = () =>
  loadGraphqlDocument('fragments.graphql', 'locations.graphql');

export const departmentsDocument = () =>
  loadGraphqlDocument('fragments.graphql', 'departments.graphql');

export const departmentByPathDocument = () =>
  loadGraphqlDocument('fragments.graphql', 'department-by-path.graphql');
