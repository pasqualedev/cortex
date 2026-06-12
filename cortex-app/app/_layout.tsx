import '../global.css'
import { useEffect } from 'react'
import { Stack } from 'expo-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useFonts, PublicSans_400Regular, PublicSans_700Bold } from '@expo-google-fonts/public-sans'
import * as SplashScreen from 'expo-splash-screen'
import { setupInterceptors } from '../lib/interceptors'

SplashScreen.preventAutoHideAsync()

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 30_000 },
  },
})

setupInterceptors()

export default function RootLayout() {
  const [fontsLoaded] = useFonts({ PublicSans_400Regular, PublicSans_700Bold })

  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync()
  }, [fontsLoaded])

  if (!fontsLoaded) return null

  return (
    <QueryClientProvider client={queryClient}>
      <Stack screenOptions={{ headerShown: false }} />
    </QueryClientProvider>
  )
}
