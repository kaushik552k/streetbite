const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000'

/**
 * Core fetch wrapper. Requires a token to be passed explicitly.
 * Use the `useApi()` hook from hooks/useApi.ts in components — it injects the
 * correct token automatically (real Clerk JWT or dev bypass, based on VITE_DEV_MODE).
 */
export async function apiRequest<T = any>(
  path: string,
  token: string,
  options?: RequestInit,
): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...options?.headers,
    },
  })

  const data = await res.json()
  if (!res.ok) {
    throw new Error(data.message || 'API request failed')
  }
  return data
}
