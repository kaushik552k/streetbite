import { useAuth } from '@clerk/clerk-react'
import { apiRequest } from '../lib/api'

const DEV_MODE = import.meta.env.VITE_DEV_MODE === 'true'
const DEV_TOKEN = import.meta.env.VITE_DEV_TOKEN as string // 'dev_bypass_admin'

/**
 * Returns a bound `api` function that automatically injects the correct
 * Bearer token into every request.
 *
 * - VITE_DEV_MODE=true  → uses VITE_DEV_TOKEN (no Clerk session needed)
 * - VITE_DEV_MODE=false → uses real Clerk JWT from the signed-in session
 *
 * Usage:
 *   const api = useApi()
 *   useQuery({ queryFn: () => api('/api/v1/admin/analytics') })
 */
export function useApi() {
  const { getToken } = useAuth()

  return async function api<T = any>(path: string, options?: RequestInit): Promise<T> {
    const token = DEV_MODE ? DEV_TOKEN : (await getToken()) ?? ''
    if (!token) {
      throw new Error(
        DEV_MODE
          ? 'Missing VITE_DEV_TOKEN while VITE_DEV_MODE=true'
          : 'Missing auth token. Please sign in again.',
      )
    }
    return apiRequest<T>(path, token, options)
  }
}
