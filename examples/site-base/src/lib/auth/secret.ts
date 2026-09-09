/**
 * Auth.js (NextAuth v5) requires AUTH_SECRET in production.
 * NEXTAUTH_SECRET is accepted as a fallback for older env names.
 */
export function isAuthSecretConfigured(
  env: NodeJS.ProcessEnv = process.env
): boolean {
  return Boolean(env.AUTH_SECRET?.trim() || env.NEXTAUTH_SECRET?.trim());
}
