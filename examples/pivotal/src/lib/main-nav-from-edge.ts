import client from '@/lib/sitecore-client';
import type { MainNavTreeNode } from '@/components/main-nav/main-nav.props';
import { pruneNonPages, toEdgeItemPath } from '@/lib/main-nav-utils';

export { extractNavigationRootId } from '@/lib/main-nav-utils';

const L1_LIMIT = 20;
const L2_LIMIT = 12;
const L3_LIMIT = 8;

type EdgeNavNode = {
  id?: string;
  name?: string;
  displayName?: string;
  path?: string;
  url?: { path?: string };
  children?: { results?: EdgeNavNode[] };
};

type ItemQueryResult = {
  item?: EdgeNavNode | null;
};

const L1_QUERY = `
  query MainNavL1($path: String!, $language: String!) {
    item(path: $path, language: $language) {
      id
      name
      displayName
      children(first: ${L1_LIMIT}) {
        results {
          id
          name
          displayName
          url { path }
        }
      }
    }
  }
`;

const CHILDREN_QUERY = `
  query MainNavChildren($path: String!, $language: String!) {
    item(path: $path, language: $language) {
      children(first: ${L2_LIMIT}) {
        results {
          id
          name
          displayName
          url { path }
          children(first: ${L3_LIMIT}) {
            results {
              id
              name
              displayName
              url { path }
            }
          }
        }
      }
    }
  }
`;

function toTreeNode(node?: EdgeNavNode | null): MainNavTreeNode | undefined {
  if (!node) return undefined;
  const children = (node.children?.results ?? [])
    .map((child) => toTreeNode(child))
    .filter((child): child is MainNavTreeNode => Boolean(child));
  return {
    id: node.id,
    name: node.displayName || node.name,
    url: node.url,
    children: { results: children },
  };
}

async function fetchChildren(path: string, language: string): Promise<MainNavTreeNode[]> {
  try {
    const result = await client.getData<ItemQueryResult>(CHILDREN_QUERY, { path, language });
    return (result?.item?.children?.results ?? [])
      .map((child) => toTreeNode(child))
      .filter((child): child is MainNavTreeNode => Boolean(child));
  } catch (error) {
    console.error('[fetchMainNavTree] children query failed:', path, error);
    return [];
  }
}

export async function fetchMainNavTree(args: {
  path: string;
  language: string;
}): Promise<MainNavTreeNode | undefined> {
  const path = toEdgeItemPath(args.path);
  if (!path) return undefined;
  const language = args.language || 'en';

  try {
    const result = await client.getData<ItemQueryResult>(L1_QUERY, { path, language });
    const root = result?.item;
    if (!root) return undefined;

    const l1 = (root.children?.results ?? []).slice(0, L1_LIMIT);
    const withChildren = await Promise.all(
      l1.map(async (item) => {
        const node = toTreeNode(item);
        if (!node?.id) return node;
        const nested = await fetchChildren(toEdgeItemPath(item.id || ''), language);
        return {
          ...node,
          children: { results: nested },
        };
      })
    );

    return pruneNonPages({
      id: root.id,
      name: root.displayName || root.name,
      children: {
        results: withChildren.filter((item): item is MainNavTreeNode => Boolean(item)),
      },
    });
  } catch (error) {
    console.error('[fetchMainNavTree] GraphQL request failed:', error);
    return undefined;
  }
}
