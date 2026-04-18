const API_URL = '/api';

export async function login(email, password) {
  const res = await fetch(`${API_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message || 'Invalid credentials');
  }

  const data = await res.json();
  localStorage.setItem('jwt_token', data.token);
  return data.token;
}

export async function getMe() {
  const token = getToken();
  if (!token) throw new Error('Not authenticated');

  const res = await fetch(`${API_URL}/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) throw new Error('Session expired');
  return res.json();
}

export function logout() {
  localStorage.removeItem('jwt_token');
}

export function getToken() {
  return localStorage.getItem('jwt_token');
}

export function isAuthenticated() {
  return !!getToken();
}
