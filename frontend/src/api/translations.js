export async function fetchTranslations(locale) {
  const res = await fetch(`/api/translations/${locale}`);
  if (!res.ok) throw new Error('Failed to load translations');
  return res.json();
}