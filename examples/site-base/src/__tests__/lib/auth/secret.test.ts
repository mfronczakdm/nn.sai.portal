import { isAuthSecretConfigured } from '@/lib/auth/secret';

describe('isAuthSecretConfigured', () => {
  it('accepts AUTH_SECRET', () => {
    expect(isAuthSecretConfigured({ AUTH_SECRET: 'opaque-secret' })).toBe(true);
  });

  it('accepts NEXTAUTH_SECRET as a fallback name', () => {
    expect(isAuthSecretConfigured({ NEXTAUTH_SECRET: 'legacy-secret' })).toBe(true);
  });

  it('rejects missing or blank secrets', () => {
    expect(isAuthSecretConfigured({})).toBe(false);
    expect(isAuthSecretConfigured({ AUTH_SECRET: '  ' })).toBe(false);
    expect(isAuthSecretConfigured({ NEXTAUTH_SECRET: '' })).toBe(false);
  });
});
