import { useEffect } from 'react'
import { Platform } from 'react-native'
import { Stack, useRouter, useSegments } from 'expo-router'
import { ClerkProvider, useAuth } from '@clerk/clerk-expo'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { StatusBar } from 'expo-status-bar'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 1000 * 60 * 5 },
  },
})

// Web-safe token cache: SecureStore on native, localStorage on web
const tokenCache = {
  async getToken(key: string): Promise<string | null> {
    try {
      if (Platform.OS === 'web') {
        return typeof localStorage !== 'undefined' ? localStorage.getItem(key) : null
      }
      const SecureStore = await import('expo-secure-store')
      return await SecureStore.getItemAsync(key)
    } catch {
      return null
    }
  },
  async saveToken(key: string, value: string): Promise<void> {
    try {
      if (Platform.OS === 'web') {
        if (typeof localStorage !== 'undefined') localStorage.setItem(key, value)
        return
      }
      const SecureStore = await import('expo-secure-store')
      await SecureStore.setItemAsync(key, value)
    } catch {}
  },
}

// Auth guard — redirects based on sign-in state
function AuthGuard() {
  const { isSignedIn, isLoaded } = useAuth()
  const segments = useSegments()
  const router = useRouter()

  useEffect(() => {
    if (!isLoaded) return
    
    // DEV MODE: Hardcode to true to bypass auth screens
    const MOCK_SIGNED_IN = true

    const inAuthGroup = segments[0] === '(auth)'
    if (!MOCK_SIGNED_IN && !inAuthGroup) {
      router.replace('/(auth)/welcome')
    } else if (MOCK_SIGNED_IN && inAuthGroup) {
      router.replace('/(tabs)')
    }
  }, [isSignedIn, isLoaded, segments])

  return null
}

export default function RootLayout() {
  return (
    <ClerkProvider
      publishableKey={process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!}
      tokenCache={tokenCache}
    >
      <QueryClientProvider client={queryClient}>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <StatusBar style="dark" />
          <AuthGuard />
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="truck/[id]" options={{ presentation: 'card', animation: 'slide_from_right' }} />
            <Stack.Screen name="order/[id]" options={{ presentation: 'card', animation: 'slide_from_bottom' }} />
            <Stack.Screen name="checkout" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
          </Stack>
        </GestureHandlerRootView>
      </QueryClientProvider>
    </ClerkProvider>
  )
}
