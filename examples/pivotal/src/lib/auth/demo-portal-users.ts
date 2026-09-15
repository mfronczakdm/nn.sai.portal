/**
 * POC demo portal accounts — no database required (works on Vercel serverless).
 * Edit this file to add/change demo logins. Passwords are intentional demo secrets.
 */
export type DemoPortalUser = {
  email: string;
  password: string;
  customerSlug: string;
  customerName: string;
};

export const DEMO_PORTAL_USERS: readonly DemoPortalUser[] = [
  {
    email: 'chipotle@example.com',
    password: 'password123',
    customerSlug: 'chipotle',
    customerName: 'Chipotle',
  },
  {
    email: 'tacobell@example.com',
    password: 'password123',
    customerSlug: 'tacobell',
    customerName: 'Taco Bell',
  },
] as const;

export type AuthenticatedDemoPortalUser = {
  id: string;
  email: string;
  customerSlug: string;
  customerName: string;
};

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

/**
 * Match email + password against {@link DEMO_PORTAL_USERS}.
 * Returns a stable id derived from customerSlug (JWT-friendly).
 */
export function authenticateDemoPortalUser(input: {
  email: string;
  password: string;
}): AuthenticatedDemoPortalUser | null {
  const email = normalizeEmail(input.email);
  const password = input.password;

  if (!email || !password) {
    return null;
  }

  const match = DEMO_PORTAL_USERS.find(
    (user) => normalizeEmail(user.email) === email && user.password === password,
  );

  if (!match) {
    return null;
  }

  return {
    id: `demo:${match.customerSlug}`,
    email: normalizeEmail(match.email),
    customerSlug: match.customerSlug,
    customerName: match.customerName,
  };
}
