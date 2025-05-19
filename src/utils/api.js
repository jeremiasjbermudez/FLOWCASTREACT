// Utility for API calls to PHP backend
export async function fetchFromPHP(endpoint, options = {}) {
  const res = await fetch(`/Archive/${endpoint}`, options);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}
