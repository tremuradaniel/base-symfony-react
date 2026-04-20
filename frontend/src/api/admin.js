const API_URL = '/api/admin/users';

const getHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${localStorage.getItem('jwt_token')}`
});

export async function fetchUsers() {
  const res = await fetch(API_URL, {
    headers: getHeaders()
  });
  if (!res.ok) throw new Error('Failed to fetch users');
  return res.json();
}

export async function fetchUser(id) {
  const res = await fetch(`${API_URL}/${id}`, {
    headers: getHeaders()
  });
  if (!res.ok) throw new Error('Failed to fetch user');
  return res.json();
}

export async function createUser(data) {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || 'Failed to create user');
  }
  return res.json();
}

export async function updateUser(id, data) {
  const res = await fetch(`${API_URL}/${id}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || 'Failed to update user');
  }
  return res.json();
}

export async function deleteUser(id) {
  const res = await fetch(`${API_URL}/${id}`, {
    method: 'DELETE',
    headers: getHeaders()
  });
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || 'Failed to delete user');
  }
  return res.json();
}
