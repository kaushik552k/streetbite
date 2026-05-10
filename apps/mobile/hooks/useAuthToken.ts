import { useAuth } from '@clerk/clerk-expo'

const DEV_MODE = process.env.EXPO_PUBLIC_DEV_MODE === 'true'
const DEV_TOKEN = 'dev_bypass'

/**
 * Returns a function that resolves to the correct Bearer token.
 * - In DEV_MODE: returns the hardcoded dev_bypass token (no Clerk needed)
 * - In production: returns the real Clerk JWT for the signed-in user
 *
 * Usage in components:
 *   const getBearerToken = useAuthToken()
 *   useQuery({ queryFn: async () => {
 *     const token = await getBearerToken()
 *     return fetch('/api/...', { headers: { Authorization: `Bearer ${token}` } })
 *   }})
 */
export function useAuthToken() {
  const { getToken } = useAuth()

  return async (): Promise<string> => {
    if (DEV_MODE) return DEV_TOKEN
    const token = await getToken()
    if (!token) throw new Error('Not authenticated — please sign in')
    return token
  }
}
