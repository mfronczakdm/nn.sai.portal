import { downloadListQueryUsesTaxonomyVariable } from '@/lib/download-list-graphql-session';

describe('downloadListQueryUsesTaxonomyVariable', () => {
  it('detects $taxonomy in operation', () => {
    expect(
      downloadListQueryUsesTaxonomyVariable(
        'query Q($taxonomy: String!) { allBCBS_PlanSecurityGroup(where: { taxonomyName_eq: $taxonomy }) { results { fileName } } }',
      ),
    ).toBe(true);
  });

  it('is false when variable is not used', () => {
    expect(downloadListQueryUsesTaxonomyVariable('{ allX { results { fileName } } }')).toBe(false);
  });
});
