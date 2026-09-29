import { createHash } from 'crypto';

import {
  getDemoProfileImportChecksum,
  getDemoProfileImportJsonl,
  getProfileImportBatchesUrl,
  importDemoIdentifiedContactProfile,
} from '@/lib/sitecore-ai-profile-import';

describe('sitecore-ai-profile-import', () => {
  const originalUrl = process.env.SITECORE_AI_PROFILE_IMPORT_URL;
  const originalKey = process.env.SITECORE_AI_PROFILE_IMPORT_API_KEY;
  const originalFetch = global.fetch;

  afterEach(() => {
    process.env.SITECORE_AI_PROFILE_IMPORT_URL = originalUrl;
    process.env.SITECORE_AI_PROFILE_IMPORT_API_KEY = originalKey;
    global.fetch = originalFetch;
  });

  it('normalizes the batches endpoint', () => {
    expect(getProfileImportBatchesUrl('https://import.example/')).toBe('https://import.example/v1/batches');
    expect(getProfileImportBatchesUrl('https://import.example/v1/batches')).toBe(
      'https://import.example/v1/batches'
    );
  });

  it('checksums the JSONL payload', () => {
    const jsonl = getDemoProfileImportJsonl();
    expect(jsonl).toContain('"recordType":"profile"');
    expect(getDemoProfileImportChecksum(jsonl)).toBe(createHash('md5').update(jsonl, 'utf8').digest('hex'));
  });

  it('skips when credentials are missing', async () => {
    delete process.env.SITECORE_AI_PROFILE_IMPORT_URL;
    delete process.env.SITECORE_AI_PROFILE_IMPORT_API_KEY;

    const result = await importDemoIdentifiedContactProfile();

    expect(result.skipped).toBe(true);
    expect(result.status).toBe(503);
  });

  it('uploads a profile batch with ApiKey auth', async () => {
    process.env.SITECORE_AI_PROFILE_IMPORT_URL = 'https://import.example';
    process.env.SITECORE_AI_PROFILE_IMPORT_API_KEY = 'test-key';

    const mockFetch = jest.fn().mockResolvedValue({
      status: 202,
      json: async () => ({ batchId: 'batch-1', status: 'QUEUED' }),
    });
    global.fetch = mockFetch as unknown as typeof fetch;

    const result = await importDemoIdentifiedContactProfile();

    expect(result.status).toBe(202);
    expect(result.body).toEqual({ batchId: 'batch-1', status: 'QUEUED' });
    expect(mockFetch).toHaveBeenCalledWith(
      'https://import.example/v1/batches',
      expect.objectContaining({
        method: 'POST',
        headers: { Authorization: 'ApiKey test-key' },
      })
    );
  });
});
