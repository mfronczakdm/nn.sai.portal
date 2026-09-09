import type { CodegenConfig } from '@graphql-codegen/cli';

/**
 * Codegen uses the local Edge schema subset in `lib/sitecore/schema.graphql`
 * so types can be generated without live Sitecore credentials.
 *
 * To introspect the real endpoint later:
 *   SITECORE_GRAPHQL_ENDPOINT + SITECORE_API_KEY (sc_apikey header)
 */
const config: CodegenConfig = {
  overwrite: true,
  schema: 'lib/sitecore/schema.graphql',
  documents: 'lib/sitecore/queries/**/*.graphql',
  generates: {
    'lib/sitecore/generated/graphql.ts': {
      plugins: ['typescript', 'typescript-operations'],
      config: {
        skipTypename: true,
        enumsAsTypes: true,
        avoidOptionals: {
          field: true,
          inputValue: false,
          object: false,
        },
      },
    },
  },
};

export default config;
