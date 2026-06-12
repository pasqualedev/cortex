import { useEffect } from 'react'
import { Stack, useRouter } from 'expo-router'
import * as SecureStore from 'expo-secure-store'
import { STORAGE_KEYS } from '../../lib/storage-keys'

export default function AuthLayout() {
  const router = useRouter()

  useEffect(() => {
    SecureStore.getItemAsync(STORAGE_KEYS.ACCESS_TOKEN).then((token) => {
      if (token) router.replace('/(app)')
    })
  }, [])

  return <Stack screenOptions={{ headerShown: false }} />
}
