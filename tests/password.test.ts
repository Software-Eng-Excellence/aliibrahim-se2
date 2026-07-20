import { hashPassword, verifyPassword } from '../src/util/password';

describe('password hashing', () => {
  it('never stores the password in plaintext', () => {
    const hashed = hashPassword('correct-horse-battery-staple');
    expect(hashed).not.toBe('correct-horse-battery-staple');
    expect(hashed).toContain(':');
  });

  it('verifies the correct password', () => {
    const hashed = hashPassword('correct-horse-battery-staple');
    expect(verifyPassword('correct-horse-battery-staple', hashed)).toBe(true);
  });

  it('rejects an incorrect password', () => {
    const hashed = hashPassword('correct-horse-battery-staple');
    expect(verifyPassword('wrong-password', hashed)).toBe(false);
  });

  it('produces a different hash for the same password on each call', () => {
    const first = hashPassword('correct-horse-battery-staple');
    const second = hashPassword('correct-horse-battery-staple');
    expect(first).not.toBe(second);
  });
});
