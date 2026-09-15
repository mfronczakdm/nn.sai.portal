import { collectPlanAssetFileNamesFromGraphqlBody } from '@/lib/download-list-bcbs-assets';

describe('collectPlanAssetFileNamesFromGraphqlBody', () => {
  it('flattens nested results and dedupes', () => {
    const body = {
      data: {
        allBCBS_PlanSecurityGroup: {
          results: [
            {
              taxonomyName: 'Maintenance Engineer',
              planSecurityGroupToAsset: {
                total: 2,
                results: [{ fileName: 'a.pdf' }, { fileName: 'b.csv' }],
              },
            },
            {
              planSecurityGroupToAsset: {
                results: [{ fileName: 'a.pdf' }, { fileName: '  ' }],
              },
            },
          ],
        },
      },
    };
    expect(collectPlanAssetFileNamesFromGraphqlBody(body)).toEqual(['a.pdf', 'b.csv']);
  });

  it('returns empty for malformed payloads', () => {
    expect(collectPlanAssetFileNamesFromGraphqlBody(null)).toEqual([]);
    expect(collectPlanAssetFileNamesFromGraphqlBody({})).toEqual([]);
  });

  it('collects FileName casing and arbitrary nesting under data', () => {
    const body = {
      data: {
        someOtherRoot: {
          edges: [{ node: { FileName: 'x.pdf' } }, { node: { nested: { fileName: 'y.doc' } } }],
        },
      },
    };
    expect(collectPlanAssetFileNamesFromGraphqlBody(body).sort()).toEqual(['x.pdf', 'y.doc']);
  });
});
