import { useEffect, useRef } from 'react'
import { View, Text, Animated, StyleSheet } from 'react-native'
import { useRouter } from 'expo-router'
import * as SecureStore from 'expo-secure-store'
import { getMe } from '../../services/user.service'
import { useAuthStore } from '../../stores/auth.store'
import { STORAGE_KEYS } from '../../lib/storage-keys'
import { colors, font } from '../../lib/theme'

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
    <View style={styles.container}>
      <Animated.View style={{ opacity: logoOpacity }}>
        <View style={styles.logoBox}>
          <Text style={styles.logoText}>C</Text>
        </View>
      </Animated.View>
      <Animated.Text
        style={[styles.title, { opacity: titleOpacity, transform: [{ translateY: titleTranslate }] }]}
      >
        CORTEX
      </Animated.Text>
      <Animated.Text style={[styles.tagline, { opacity: taglineOpacity }]}>
        Fortaleça seu cérebro
      </Animated.Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg950,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  logoBox: {
    width: 64,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    color: colors.indigo500,
    fontSize: font['5xl'],
    fontWeight: 'bold',
  },
  title: {
    color: colors.text100,
    fontSize: font['2xl'],
    fontWeight: 'bold',
    letterSpacing: 6,
  },
  tagline: {
    color: colors.text500,
    fontSize: font.sm,
  },
})
