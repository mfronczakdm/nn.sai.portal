import path from 'node:path';

const SQLITE_FILE_PREFIX = /^file:/i;

/**
 * Canonical SQLite file for local portal auth: `examples/site-base/prisma/dev.db`.
 *
 * Prisma CLI resolves `file:./dev.db` relative to `prisma/schema.prisma`.
 * Prisma Client in Next.js may resolve the same relative URL from a different cwd
 * (e.g. `.next`), so runtime always uses an absolute `file:` URL.
 */
export function resolvePortalDatabaseUrl(
  envUrl: string | undefined,
  cwd = process.cwd(),
): string {
  const canonicalPath = path.resolve(cwd, 'prisma', 'dev.db').replace(/\\/g, '/');
  const canonicalUrl = `file:${canonicalPath}`;

  const trimmed = envUrl?.trim();
  if (!trimmed) {
    return canonicalUrl;
  }

  if (!SQLITE_FILE_PREFIX.test(trimmed)) {
    return trimmed;
  }

  return canonicalUrl;
}

/** Sets `process.env.DATABASE_URL` before constructing PrismaClient. */
export function applyPortalDatabaseUrl(cwd = process.cwd()): string {
  const url = resolvePortalDatabaseUrl(process.env.DATABASE_URL, cwd);
  process.env.DATABASE_URL = url;
  return url;
}
