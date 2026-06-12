import { ScrollView, View, Text, TouchableOpacity } from 'react-native'
import { useRouter } from 'expo-router'
import { useQuery } from '@tanstack/react-query'
import { getDashboard } from '../../services/dashboard.service'
import { useAuthStore } from '../../stores/auth.store'
import { BrainStatus } from '../../components/brain-status'
import { SkeletonLoader } from '../../components/ui/SkeletonLoader'
import { QueryKeys } from '../../lib/query-keys'

export default function HomeScreen() {
  const router = useRouter()
  const user = useAuthStore((s) => s.user)

  const { data: dashboard, isLoading } = useQuery({
    queryKey: QueryKeys.dashboard,
    queryFn: getDashboard,
  })

  return (
    <ScrollView className="flex-1 bg-zinc-950" contentContainerClassName="px-4 py-6 gap-6">
      {/* Greeting */}
      <View className="gap-1">
        <Text className="text-zinc-500 text-sm">Olá,</Text>
        <Text className="text-zinc-100 text-2xl font-bold">{user?.name ?? '—'}</Text>
      </View>

      {/* Challenge CTA */}
      <View className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 gap-3">
        <Text className="text-zinc-500 text-xs uppercase tracking-wide">Próximo Desafio</Text>
        <Text className="text-zinc-400 text-sm">Continue treinando seu cérebro hoje.</Text>
        <TouchableOpacity
          className="bg-indigo-500 h-12 rounded-xl items-center justify-center"
          onPress={() => router.push('/(app)/desafio')}
          accessibilityRole="button"
          accessibilityLabel="Iniciar desafio"
        >
          <Text className="text-white font-bold text-base">Iniciar Desafio</Text>
        </TouchableOpacity>
      </View>

      {/* Weekly Activity */}
      {isLoading ? (
        <SkeletonLoader width="100%" height={80} rounded />
      ) : dashboard ? (
        <View className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 gap-3">
          <Text className="text-zinc-500 text-xs uppercase tracking-wide">Atividade da Semana</Text>
          <View className="flex-row justify-between">
            <View className="items-center gap-0.5">
              <Text className="text-zinc-100 font-bold text-lg">
                {dashboard.recentActivity.questionsThisWeek}
              </Text>
              <Text className="text-zinc-500 text-xs">questões</Text>
            </View>
            <View className="items-center gap-0.5">
              <Text className="text-zinc-100 font-bold text-lg">
                {dashboard.recentActivity.correctThisWeek}
              </Text>
              <Text className="text-zinc-500 text-xs">acertos</Text>
            </View>
            <View className="items-center gap-0.5">
              <Text className="text-zinc-100 font-bold text-lg">
                {dashboard.recentActivity.sessionsThisWeek}
              </Text>
              <Text className="text-zinc-500 text-xs">sessões</Text>
            </View>
          </View>
        </View>
      ) : null}

      {/* Brain Status */}
      {isLoading ? (
        <SkeletonLoader width="100%" height={220} rounded />
      ) : dashboard ? (
        <BrainStatus
          metrics={dashboard.brainMetrics}
          streakDays={dashboard.user.streakDays}
          totalXP={dashboard.user.xp}
        />
      ) : null}
    </ScrollView>
  )
}
