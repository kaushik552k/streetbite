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
  let timeout: ReturnType<typeof setTimeout> | undefined
  let signal = options?.signal

  if (!signal) {
    const controller = new AbortController()
    timeout = setTimeout(() => controller.abort(), 15000)
    signal = controller.signal
  }

  let res: Response
  try {
    res = await fetch(`${API_BASE}${path}`, {
      ...options,
      signal,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        ...options?.headers,
      },
    })
  } finally {
    if (timeout) clearTimeout(timeout)
  }

  const contentType = res.headers.get('content-type') || ''
  const hasJson = contentType.includes('application/json')
  const data = res.status === 204 ? null : hasJson ? await res.json() : await res.text()

  if (!res.ok) {
    const message =
      typeof data === 'object' && data && 'message' in data
        ? String((data as any).message)
        : typeof data === 'string' && data
        ? data
        : 'API request failed'
    throw new Error(message)
  }
  return data as T
}
