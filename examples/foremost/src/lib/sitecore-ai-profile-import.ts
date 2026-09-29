import { createHash } from 'crypto';

import { getDemoIdentifiedContactProfileImportRecord } from '@/lib/demo-identified-contact';

export const PROFILE_IMPORT_URL_ENV = 'SITECORE_AI_PROFILE_IMPORT_URL';
export const PROFILE_IMPORT_API_KEY_ENV = 'SITECORE_AI_PROFILE_IMPORT_API_KEY';

let inFlightImport: Promise<{
  skipped?: boolean;
  status: number;
  body: Record<string, unknown>;
}> | null = null;

export function getProfileImportBatchesUrl(baseUrl: string): string {
  const trimmed = baseUrl.trim().replace(/\/$/, '');
  return trimmed.endsWith('/v1/batches') ? trimmed : `${trimmed}/v1/batches`;
}

export function getDemoProfileImportJsonl(): string {
  return `${JSON.stringify(getDemoIdentifiedContactProfileImportRecord())}\n`;
}

export function getDemoProfileImportChecksum(jsonl: string): string {
  return createHash('md5').update(jsonl, 'utf8').digest('hex');
}

export async function importDemoIdentifiedContactProfile(): Promise<{
  skipped?: boolean;
  status: number;
  body: Record<string, unknown>;
}> {
  if (inFlightImport) return inFlightImport;

  inFlightImport = importDemoIdentifiedContactProfileNow().finally(() => {
    inFlightImport = null;
  });

  return inFlightImport;
}

async function importDemoIdentifiedContactProfileNow(): Promise<{
  skipped?: boolean;
  status: number;
  body: Record<string, unknown>;
}> {
  const baseUrl = process.env[PROFILE_IMPORT_URL_ENV];
  const apiKey = process.env[PROFILE_IMPORT_API_KEY_ENV];

  if (!baseUrl || !apiKey) {
    return {
      skipped: true,
      status: 503,
      body: {
        message:
          'SitecoreAI Profile Import credentials are missing. Set SITECORE_AI_PROFILE_IMPORT_URL and SITECORE_AI_PROFILE_IMPORT_API_KEY from Performance > Settings > Profile import > Credentials.',
      },
    };
  }

  const jsonl = getDemoProfileImportJsonl();
  const md5 = getDemoProfileImportChecksum(jsonl);
  const formData = new FormData();
  formData.append('file', new Blob([jsonl], { type: 'application/octet-stream' }), 'tom-samuels.jsonl');
  formData.append('md5', md5);

  const response = await fetch(getProfileImportBatchesUrl(baseUrl), {
    method: 'POST',
    headers: {
      Authorization: `ApiKey ${apiKey}`,
    },
    body: formData,
  });

  let body: Record<string, unknown> = {};
  try {
    body = (await response.json()) as Record<string, unknown>;
  } catch {
    body = { status: response.status };
  }

  return { status: response.status, body };
}
