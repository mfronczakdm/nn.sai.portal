type AuthSecretEnv = {
  AUTH_SECRET?: string;
  NEXTAUTH_SECRET?: string;
};

/**
 * Auth.js (NextAuth v5) requires AUTH_SECRET in production.
 * NEXTAUTH_SECRET is accepted as a fallback for older env names.
 */
export function isAuthSecretConfigured(
  env: AuthSecretEnv | NodeJS.ProcessEnv = process.env
): boolean {
  const source = env as AuthSecretEnv;
  return Boolean(source.AUTH_SECRET?.trim() || source.NEXTAUTH_SECRET?.trim());
}
