/**
 * Prove portal credentials work against the same Prisma path Next.js uses.
 * Usage: npx tsx scripts/verify-chipotle-login.ts
 */
import { applyPortalDatabaseUrl } from '../src/lib/auth/sqlite-url';
import { authenticatePortalUser, findUserByEmail } from '../src/lib/auth/users';
import { prisma } from '../src/lib/auth/db';

async function main() {
  const databaseUrl = applyPortalDatabaseUrl();
  console.log('DATABASE_URL', databaseUrl);

  const users = await prisma.user.findMany({
    select: { email: true, customer: { select: { slug: true } } },
  });
  console.log('users', users);

  const chipotle = await findUserByEmail('chipotle@example.com');
  if (!chipotle) {
    console.error('FAIL: chipotle@example.com not in database. Run npm run db:seed.');
    process.exit(1);
  }

  const ok = await authenticatePortalUser({
    email: 'chipotle@example.com',
    password: 'password123',
  });
  console.log('authenticate chipotle', ok);

  if (!ok) {
    console.error('FAIL: authenticatePortalUser returned null');
    process.exit(1);
  }

  console.log('OK: authenticatePortalUser succeeded');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
