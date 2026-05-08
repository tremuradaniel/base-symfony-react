import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  fetchUsers,
  fetchUser,
  createUser,
  updateUser,
  deleteUser,
} from '../admin';

function clearStorage() {
  localStorage.removeItem('jwt_token');
}

function setToken(token = 'mock-admin-token') {
  localStorage.setItem('jwt_token', token);
}

// ── fetchUsers() ──────────────────────────────────────────────────────────────

describe('fetchUsers()', () => {
  beforeEach(() => setToken());
  afterEach(clearStorage);

  it('returns an array of users', async () => {
    const users = await fetchUsers();
    expect(Array.isArray(users)).toBe(true);
    expect(users.length).toBeGreaterThan(0);
  });

  it('each user has id, email, and roles', async () => {
    const users = await fetchUsers();
    users.forEach((u) => {
      expect(u).toHaveProperty('id');
      expect(u).toHaveProperty('email');
      expect(u).toHaveProperty('roles');
    });
  });
});

// ── fetchUser(id) ─────────────────────────────────────────────────────────────

describe('fetchUser()', () => {
  beforeEach(() => setToken());
  afterEach(clearStorage);

  it('returns the user object for a known id', async () => {
    const user = await fetchUser(1);
    expect(user).toHaveProperty('id', 1);
    expect(user).toHaveProperty('email', 'alice@example.com');
  });

  it('throws for an unknown user id', async () => {
    await expect(fetchUser(99999)).rejects.toThrow();
  });
});

// ── createUser() ──────────────────────────────────────────────────────────────

describe('createUser()', () => {
  beforeEach(() => setToken());
  afterEach(clearStorage);

  it('resolves with success message on valid data', async () => {
    const data = await createUser({ email: 'new@example.com', password: 'pass', roles: ['ROLE_USER'] });
    expect(data).toHaveProperty('message');
  });

  it('throws when email is missing', async () => {
    await expect(createUser({ password: 'pass' })).rejects.toThrow();
  });

  it('throws when password is missing', async () => {
    await expect(createUser({ email: 'new@example.com' })).rejects.toThrow();
  });

  it('throws on duplicate email (409)', async () => {
    await expect(
      createUser({ email: 'dup@example.com', password: 'pass' }),
    ).rejects.toThrow();
  });
});

// ── updateUser() ──────────────────────────────────────────────────────────────

describe('updateUser()', () => {
  beforeEach(() => setToken());
  afterEach(clearStorage);

  it('resolves with success message on valid data', async () => {
    const data = await updateUser(1, { roles: ['ROLE_SUPER_ADMIN'] });
    expect(data).toHaveProperty('message');
  });

  it('throws for a non-existent user', async () => {
    await expect(updateUser(99999, { roles: ['ROLE_USER'] })).rejects.toThrow();
  });

  it('throws when roles field is missing', async () => {
    await expect(updateUser(1, {})).rejects.toThrow();
  });
});

// ── deleteUser() ──────────────────────────────────────────────────────────────

describe('deleteUser()', () => {
  beforeEach(() => setToken());
  afterEach(clearStorage);

  it('resolves with success message on valid id', async () => {
    const data = await deleteUser(1);
    expect(data).toHaveProperty('message');
  });

  it('throws for a non-existent user id', async () => {
    await expect(deleteUser(99999)).rejects.toThrow();
  });
});
