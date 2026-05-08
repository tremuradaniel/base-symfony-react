import React from 'react';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import ProtectedRoute from '../ProtectedRoute';

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Builds a minimal fake JWT with the given roles baked into the payload.
 * The ProtectedRoute only base64-decodes the payload — it does NOT verify
 * the signature — so a fake token is sufficient for unit tests.
 */
function buildFakeJwt(roles = ['ROLE_USER']) {
  const payload = btoa(JSON.stringify({ roles }));
  return `fakeheader.${payload}.fakesignature`;
}

function clearStorage() {
  localStorage.removeItem('jwt_token');
}

// ── Render helper ─────────────────────────────────────────────────────────────

/**
 * Renders ProtectedRoute inside a MemoryRouter with a /login and /admin/login
 * fallback so we can verify redirects without crashing.
 */
function renderProtectedRoute({
  requiredRole = 'ROLE_USER',
  redirectTo = '/login',
} = {}) {
  return render(
    <MemoryRouter initialEntries={['/protected']}>
      <Routes>
        <Route
          path="/protected"
          element={
            <ProtectedRoute requiredRole={requiredRole} redirectTo={redirectTo}>
              <div data-testid="protected-content">Secret Content</div>
            </ProtectedRoute>
          }
        />
        <Route path="/login" element={<div data-testid="login-page">Login Page</div>} />
        <Route path="/admin/login" element={<div data-testid="admin-login-page">Admin Login</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('ProtectedRoute', () => {
  beforeEach(clearStorage);
  afterEach(clearStorage);

  it('renders children when the user has the required role', () => {
    localStorage.setItem('jwt_token', buildFakeJwt(['ROLE_USER']));
    renderProtectedRoute({ requiredRole: 'ROLE_USER' });
    expect(screen.getByTestId('protected-content')).toBeInTheDocument();
  });

  it('redirects to /login when no token is stored', () => {
    renderProtectedRoute({ requiredRole: 'ROLE_USER', redirectTo: '/login' });
    expect(screen.getByTestId('login-page')).toBeInTheDocument();
    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
  });

  it('redirects when the user does not have the required role', () => {
    localStorage.setItem('jwt_token', buildFakeJwt(['ROLE_USER']));
    renderProtectedRoute({
      requiredRole: 'ROLE_SUPER_ADMIN',
      redirectTo: '/admin/login',
    });
    expect(screen.getByTestId('admin-login-page')).toBeInTheDocument();
    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
  });

  it('renders children for ROLE_SUPER_ADMIN when that role is required', () => {
    localStorage.setItem('jwt_token', buildFakeJwt(['ROLE_SUPER_ADMIN', 'ROLE_USER']));
    renderProtectedRoute({
      requiredRole: 'ROLE_SUPER_ADMIN',
      redirectTo: '/admin/login',
    });
    expect(screen.getByTestId('protected-content')).toBeInTheDocument();
  });

  it('redirects to the custom redirectTo path', () => {
    renderProtectedRoute({ requiredRole: 'ROLE_USER', redirectTo: '/login' });
    expect(screen.getByTestId('login-page')).toBeInTheDocument();
  });

  it('redirects when the token is malformed / cannot be decoded', () => {
    localStorage.setItem('jwt_token', 'this-is-not-a-jwt');
    renderProtectedRoute({ requiredRole: 'ROLE_USER', redirectTo: '/login' });
    expect(screen.getByTestId('login-page')).toBeInTheDocument();
    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
  });
});
