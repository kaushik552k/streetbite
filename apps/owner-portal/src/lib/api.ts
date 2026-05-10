const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000'

// Use dev_bypass_owner so API authenticates requests as OWNER role
const DEV_TOKEN = 'dev_bypass_owner'

export async function apiRequest<T = any>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${DEV_TOKEN}`,
      ...options?.headers,
    },
  })

  const data = await res.json()
  if (!res.ok) {
    throw new Error(data.message || 'API request failed')
  }
  return data
}
