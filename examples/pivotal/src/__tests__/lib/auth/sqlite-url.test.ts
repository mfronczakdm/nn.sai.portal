import path from 'node:path';

import { resolvePortalDatabaseUrl } from '@/lib/auth/sqlite-url';

describe('sqlite-url', () => {
  it('resolves missing or relative SQLite URLs to prisma/dev.db', () => {
    const cwd = path.join('C:', 'projects', 'site-base');
    const expected = `file:${path.resolve(cwd, 'prisma', 'dev.db').replace(/\\/g, '/')}`;

    expect(resolvePortalDatabaseUrl(undefined, cwd)).toBe(expected);
    expect(resolvePortalDatabaseUrl('file:./dev.db', cwd)).toBe(expected);
    expect(resolvePortalDatabaseUrl('file:./prisma/dev.db', cwd)).toBe(expected);
  });

  it('leaves non-SQLite URLs unchanged', () => {
    const postgres = 'postgresql://user:pass@localhost:5432/portal';
    expect(resolvePortalDatabaseUrl(postgres)).toBe(postgres);
  });
});
