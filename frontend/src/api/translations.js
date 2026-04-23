const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

export async function fetchTranslations(locale) {
  const res = await fetch(`${API_BASE}/translations/${locale}`);
  if (!res.ok) throw new Error('Failed to load translations');
  return res.json();
}