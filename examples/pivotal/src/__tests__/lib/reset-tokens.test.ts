import { generateResetTokenValue } from '@/lib/auth/reset-tokens';

describe('reset-tokens', () => {
  it('generates unique token strings', () => {
    const a = generateResetTokenValue();
    const b = generateResetTokenValue();
    expect(a).not.toBe(b);
    expect(a.length).toBeGreaterThan(32);
  });
});
