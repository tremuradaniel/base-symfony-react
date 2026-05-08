import { http, HttpResponse } from 'msw';

// ── Auth ─────────────────────────────────────────────────────────────────────

const VALID_EMAIL = 'alice@example.com';
const VALID_PASSWORD = 'secret123';
const MOCK_TOKEN = 'header.eyJyb2xlcyI6WyJST0xFX1VTRVIiXSwiZW1haWwiOiJhbGljZUBleGFtcGxlLmNvbSJ9.signature';
const ADMIN_TOKEN = 'header.eyJyb2xlcyI6WyJST0xFX1NVUEVSX0FETUlOIiwiUk9MRV9VU0VSIl0sImVtYWlsIjoiYWRtaW5AZXhhbXBsZS5jb20ifQ.signature';

export const handlers = [
  // POST /api/login
  http.post('/api/login', async ({ request }) => {
    const body = await request.json();
    if (body.email === VALID_EMAIL && body.password === VALID_PASSWORD) {
      return HttpResponse.json({ token: MOCK_TOKEN });
    }
    if (body.email === 'admin@example.com' && body.password === 'adminpass') {
      return HttpResponse.json({ token: ADMIN_TOKEN });
    }
    return HttpResponse.json({ message: 'Invalid credentials' }, { status: 401 });
  }),

  // GET /api/me
  http.get('/api/me', ({ request }) => {
    const auth = request.headers.get('Authorization');
    if (!auth || !auth.startsWith('Bearer ')) {
      return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    const token = auth.replace('Bearer ', '');
    if (token === MOCK_TOKEN) {
      return HttpResponse.json({ email: VALID_EMAIL, roles: ['ROLE_USER'] });
    }
    return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }),

  // POST /api/forgot-password
  http.post('/api/forgot-password', async ({ request }) => {
    const body = await request.json();
    if (!body.email || body.email.trim() === '') {
      return HttpResponse.json({ message: 'Email is required.' }, { status: 400 });
    }
    return HttpResponse.json({
      message: 'If this email is registered, a reset link has been sent.',
    });
  }),

  // POST /api/reset-password
  http.post('/api/reset-password', async ({ request }) => {
    const body = await request.json();
    if (!body.token || !body.password) {
      return HttpResponse.json({ message: 'Token and password are required.' }, { status: 400 });
    }
    if (body.token === 'valid-reset-token') {
      return HttpResponse.json({ message: 'Password has been reset successfully.' });
    }
    return HttpResponse.json({ message: 'Invalid or expired reset token.' }, { status: 400 });
  }),

  // ── Admin Users ────────────────────────────────────────────────────────────

  // GET /api/admin/users
  http.get('/api/admin/users', () => {
    return HttpResponse.json([
      { id: 1, email: 'alice@example.com', roles: ['ROLE_USER'] },
      { id: 2, email: 'bob@example.com', roles: ['ROLE_USER'] },
    ]);
  }),

  // GET /api/admin/users/:id
  http.get('/api/admin/users/:id', ({ params }) => {
    const id = Number(params.id);
    if (id === 1) {
      return HttpResponse.json({ id: 1, email: 'alice@example.com', roles: ['ROLE_USER'] });
    }
    return HttpResponse.json({ message: 'User not found.' }, { status: 404 });
  }),

  // POST /api/admin/users
  http.post('/api/admin/users', async ({ request }) => {
    const body = await request.json();
    if (!body.email || !body.password) {
      return HttpResponse.json({ message: 'Email and password are required.' }, { status: 400 });
    }
    if (body.email === 'dup@example.com') {
      return HttpResponse.json({ message: 'User already exists.' }, { status: 409 });
    }
    return HttpResponse.json({ message: 'User created successfully.' }, { status: 201 });
  }),

  // PUT /api/admin/users/:id
  http.put('/api/admin/users/:id', async ({ params, request }) => {
    const id = Number(params.id);
    const body = await request.json();
    if (!body.roles) {
      return HttpResponse.json({ message: 'Roles are required.' }, { status: 400 });
    }
    if (id === 99999) {
      return HttpResponse.json({ message: 'User not found.' }, { status: 404 });
    }
    return HttpResponse.json({ message: 'User updated successfully.' });
  }),

  // DELETE /api/admin/users/:id
  http.delete('/api/admin/users/:id', ({ params }) => {
    const id = Number(params.id);
    if (id === 99999) {
      return HttpResponse.json({ message: 'User not found.' }, { status: 404 });
    }
    return HttpResponse.json({ message: 'User deleted successfully.' });
  }),

  // ── Translations ───────────────────────────────────────────────────────────

  http.get('/api/translations/:locale', ({ params }) => {
    if (params.locale === 'ro') {
      return HttpResponse.json({ hello: 'Bună ziua', logout: 'Deconectare' });
    }
    return HttpResponse.json({ hello: 'Hello', logout: 'Logout' });
  }),
];
