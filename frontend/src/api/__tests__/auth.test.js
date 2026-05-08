import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { login, getMe, logout, getToken, isAuthenticated, forgotPassword, resetPassword } from '../auth';

// ── Helpers ───────────────────────────────────────────────────────────────────

function clearStorage() {
  localStorage.removeItem('jwt_token');
}

const VALID_TOKEN = 'header.eyJyb2xlcyI6WyJST0xFX1VTRVIiXSwiZW1haWwiOiJhbGljZUBleGFtcGxlLmNvbSJ9.signature';

// ── login() ───────────────────────────────────────────────────────────────────

describe('login()', () => {
  beforeEach(clearStorage);
  afterEach(clearStorage);

  it('returns a token and stores it in localStorage on success', async () => {
    const token = await login('alice@example.com', 'secret123');
    expect(token).toBeDefined();
    expect(token).toBe(VALID_TOKEN);
    expect(localStorage.getItem('jwt_token')).toBe(VALID_TOKEN);
  });

  it('throws on wrong password', async () => {
    await expect(login('alice@example.com', 'wrongpass')).rejects.toThrow();
  });

  it('throws on unknown email', async () => {
    await expect(login('nobody@example.com', 'pass')).rejects.toThrow();
  });

  it('does not store a token in localStorage on failure', async () => {
    try {
      await login('alice@example.com', 'wrongpass');
    } catch {
      // expected
    }
    expect(localStorage.getItem('jwt_token')).toBeNull();
  });
});

// ── getMe() ───────────────────────────────────────────────────────────────────

describe('getMe()', () => {
  beforeEach(clearStorage);
  afterEach(clearStorage);

  it('returns user data when a valid token is stored', async () => {
    localStorage.setItem('jwt_token', VALID_TOKEN);
    const data = await getMe();
    expect(data.email).toBe('alice@example.com');
    expect(data.roles).toContain('ROLE_USER');
  });

  it('throws when no token is in localStorage', async () => {
    await expect(getMe()).rejects.toThrow('Not authenticated');
  });

  it('throws when the token is invalid', async () => {
    localStorage.setItem('jwt_token', 'bad.token.value');
    await expect(getMe()).rejects.toThrow();
  });
});

// ── logout() ─────────────────────────────────────────────────────────────────

describe('logout()', () => {
  it('removes jwt_token from localStorage', () => {
    localStorage.setItem('jwt_token', 'some-token');
    logout();
    expect(localStorage.getItem('jwt_token')).toBeNull();
  });

  it('does not throw when no token is present', () => {
    clearStorage();
    expect(() => logout()).not.toThrow();
  });
});

// ── getToken() ────────────────────────────────────────────────────────────────

describe('getToken()', () => {
  beforeEach(clearStorage);
  afterEach(clearStorage);

  it('returns null when no token is stored', () => {
    expect(getToken()).toBeNull();
  });

  it('returns the stored token', () => {
    localStorage.setItem('jwt_token', 'mytoken');
    expect(getToken()).toBe('mytoken');
  });
});

// ── isAuthenticated() ─────────────────────────────────────────────────────────

describe('isAuthenticated()', () => {
  beforeEach(clearStorage);
  afterEach(clearStorage);

  it('returns false when no token is stored', () => {
    expect(isAuthenticated()).toBe(false);
  });

  it('returns true when a token is stored', () => {
    localStorage.setItem('jwt_token', 'mytoken');
    expect(isAuthenticated()).toBe(true);
  });
});

// ── forgotPassword() ──────────────────────────────────────────────────────────

describe('forgotPassword()', () => {
  it('resolves with message on success', async () => {
    const data = await forgotPassword('alice@example.com');
    expect(data).toHaveProperty('message');
  });

  it('also resolves for unknown email (no email reveal)', async () => {
    const data = await forgotPassword('nobody@example.com');
    expect(data).toHaveProperty('message');
  });

  it('throws when email is empty', async () => {
    await expect(forgotPassword('')).rejects.toThrow();
  });
});

// ── resetPassword() ───────────────────────────────────────────────────────────

describe('resetPassword()', () => {
  it('resolves with message on valid token', async () => {
    const data = await resetPassword('valid-reset-token', 'newpassword123');
    expect(data).toHaveProperty('message');
  });

  it('throws on invalid token', async () => {
    await expect(resetPassword('bad-token', 'newpassword123')).rejects.toThrow();
  });

  it('throws when token is empty', async () => {
    await expect(resetPassword('', 'newpassword123')).rejects.toThrow();
  });

  it('throws when password is empty', async () => {
    await expect(resetPassword('valid-reset-token', '')).rejects.toThrow();
  });
});
