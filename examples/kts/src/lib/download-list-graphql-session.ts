/** GraphQL variable name expected in the CMS query, e.g. `query X($taxonomy: String!) { ... }`. */
export const DOWNLOAD_LIST_TAXONOMY_VARIABLE = 'taxonomy';

/** True when the operation text references the `$taxonomy` variable (server injects from session). */
export function downloadListQueryUsesTaxonomyVariable(query: string): boolean {
  return /\$taxonomy\b/.test(query);
}
