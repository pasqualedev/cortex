import { useEffect, useRef } from 'react'
import { View, Text, Animated } from 'react-native'
import { useRouter } from 'expo-router'
import * as SecureStore from 'expo-secure-store'
import { getMe } from '../../services/user.service'
import { useAuthStore } from '../../stores/auth.store'
import { STORAGE_KEYS } from '../../lib/storage-keys'

export default function SplashScreen() {
  const router = useRouter()
  const logoOpacity = useRef(new Animated.Value(0)).current
  const titleTranslate = useRef(new Animated.Value(12)).current
  const titleOpacity = useRef(new Animated.Value(0)).current
  const taglineOpacity = useRef(new Animated.Value(0)).current

  useEffect(() => {
    Animated.sequence([
      Animated.timing(logoOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.parallel([
        Animated.timing(titleOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.timing(titleTranslate, { toValue: 0, duration: 300, useNativeDriver: true }),
      ]),
      Animated.timing(taglineOpacity, { toValue: 1, duration: 250, useNativeDriver: true }),
    ]).start()

    const resolve = async () => {
      const token = await SecureStore.getItemAsync(STORAGE_KEYS.ACCESS_TOKEN)
      if (!token) { router.replace('/(auth)/onboarding'); return }
      try {
        const user = await getMe()
        useAuthStore.getState().setUser(user)
        if (!user.hasCompletedOnboarding) { router.replace('/(auth)/onboarding'); return }
        router.replace('/(app)')
      } catch {
        router.replace('/(auth)/login')
      }
    }
    resolve()
  }, [])

  return (
    <View className="flex-1 bg-zinc-950 items-center justify-center gap-3">
      <Animated.View style={{ opacity: logoOpacity }}>
        <View className="w-16 h-16 items-center justify-center">
          <Text className="text-indigo-500 text-5xl font-bold">C</Text>
        </View>
      </Animated.View>
      <Animated.Text
        style={{ opacity: titleOpacity, transform: [{ translateY: titleTranslate }] }}
        className="text-zinc-100 text-2xl font-bold tracking-widest"
      >
        CORTEX
      </Animated.Text>
      <Animated.Text style={{ opacity: taglineOpacity }} className="text-zinc-500 text-sm">
        Fortaleça seu cérebro
      </Animated.Text>
    </View>
  )
}
