import { authenticateDemoPortalUser } from '@/lib/auth/demo-portal-users';
import { prisma } from '@/lib/auth/db';
import { verifyPassword } from '@/lib/auth/password';

export type AuthenticatedPortalUser = {
  id: string;
  email: string;
  customerSlug: string;
  customerName: string;
};

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function logAuthFailure(reason: string, detail?: string): void {
  if (detail) {
    console.error(`[auth] Portal login failed: ${reason}. ${detail}`);
    return;
  }
  console.error(`[auth] Portal login failed: ${reason}.`);
}

/**
 * Portal login: demo users file first (Vercel-safe), then optional Prisma SQLite for local.
 */
export async function authenticatePortalUser(input: {
  email: string;
  password: string;
}): Promise<AuthenticatedPortalUser | null> {
  const email = normalizeEmail(input.email);
  const password = input.password;

  if (!email || !password) {
    logAuthFailure('missing email or password');
    return null;
  }

  const demoUser = authenticateDemoPortalUser({ email, password });
  if (demoUser) {
    return demoUser;
  }

  let user: Awaited<ReturnType<typeof findUserByEmail>>;
  try {
    user = await findUserByEmail(email);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (/Environment variable not found:\s*DATABASE_URL/i.test(message)) {
      logAuthFailure(
        'DATABASE_URL missing in Prisma runtime',
        'Demo file users still work without a DB. For Prisma local: set DATABASE_URL and run db:push/db:seed.',
      );
      return null;
    }
    if (/no such table|does not exist|Unable to open|ENOENT/i.test(message)) {
      logAuthFailure(
        'database unavailable',
        'Using demo users only. For Prisma local: run `npm run db:push && npm run db:seed`.',
      );
      return null;
    }
    logAuthFailure('database lookup error', message);
    return null;
  }

  if (!user) {
    logAuthFailure('user not found', `email=${email}`);
    return null;
  }

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) {
    logAuthFailure('password mismatch', `email=${email}`);
    return null;
  }

  return {
    id: user.id,
    email: user.email,
    customerSlug: user.customer.slug,
    customerName: user.customer.name,
  };
}

export async function findUserByEmail(email: string) {
  return prisma.user.findUnique({
    where: { email: normalizeEmail(email) },
    include: { customer: true },
  });
}
