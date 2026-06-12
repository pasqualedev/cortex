import { useEffect } from 'react'
import { Tabs, useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import * as SecureStore from 'expo-secure-store'
import { STORAGE_KEYS } from '../../lib/storage-keys'

export default function AppLayout() {
  const router = useRouter()

  useEffect(() => {
    SecureStore.getItemAsync(STORAGE_KEYS.ACCESS_TOKEN).then((token) => {
      if (!token) router.replace('/(auth)')
    })
  }, [])

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: { backgroundColor: '#09090b', borderTopColor: '#27272a', borderTopWidth: 1 },
        tabBarActiveTintColor: '#6366f1',
        tabBarInactiveTintColor: '#71717a',
        tabBarLabelStyle: { fontSize: 11 },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => <Ionicons name="brain-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="progresso"
        options={{
          title: 'Progresso',
          tabBarIcon: ({ color, size }) => <Ionicons name="analytics-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="perfil"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color, size }) => <Ionicons name="person-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen name="desafio/index" options={{ href: null }} />
      <Tabs.Screen name="desafio/resultado" options={{ href: null }} />
    </Tabs>
  )
}
