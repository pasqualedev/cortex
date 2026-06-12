import { View, Text, ScrollView } from 'react-native'
import { useRouter } from 'expo-router'
import { useAuthStore } from '../../stores/auth.store'
import { Button } from '../../components/ui/Button'

export default function PerfilScreen() {
  const router = useRouter()
  const user = useAuthStore((s) => s.user)
  const clearAuth = useAuthStore((s) => s.clearAuth)

  const handleLogout = async () => {
    await clearAuth()
    router.replace('/(auth)/login')
  }

  return (
    <ScrollView className="flex-1 bg-zinc-950" contentContainerClassName="px-4 py-6 gap-6">
      {/* Avatar & Identity */}
      <View className="items-center gap-3 py-4">
        <View
          className="w-20 h-20 rounded-full bg-indigo-500/20 border border-indigo-500 items-center justify-center"
          accessibilityLabel="Avatar do usuário"
        >
          <Text className="text-indigo-400 text-3xl font-bold">
            {user?.name?.charAt(0).toUpperCase() ?? '?'}
          </Text>
        </View>
        <View className="items-center gap-0.5">
          <Text className="text-zinc-100 text-xl font-bold">{user?.name ?? '—'}</Text>
          <Text className="text-zinc-500 text-sm">{user?.email ?? '—'}</Text>
        </View>
      </View>

      {/* Stats */}
      <View className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
        <View className="flex-row justify-around">
          <View className="items-center gap-0.5">
            <Text className="text-zinc-100 font-bold text-2xl">{user?.level ?? 0}</Text>
            <Text className="text-zinc-500 text-xs">Nível</Text>
          </View>
          <View className="w-px bg-zinc-800" />
          <View className="items-center gap-0.5">
            <Text className="text-zinc-100 font-bold text-2xl">{user?.xp ?? 0}</Text>
            <Text className="text-zinc-500 text-xs">XP Total</Text>
          </View>
          <View className="w-px bg-zinc-800" />
          <View className="items-center gap-0.5">
            <Text className="text-zinc-100 font-bold text-2xl">{user?.streakDays ?? 0}</Text>
            <Text className="text-zinc-500 text-xs">Sequência</Text>
          </View>
        </View>
      </View>

      {/* Actions */}
      <View className="gap-2">
        <Button label="Sair da Conta" onPress={handleLogout} variant="secondary" />
      </View>
    </ScrollView>
  )
}
