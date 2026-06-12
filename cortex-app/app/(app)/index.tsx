import { ScrollView, View, Text, TouchableOpacity } from 'react-native'
import { useRouter } from 'expo-router'
import { useQuery } from '@tanstack/react-query'
import { getDashboard } from '../../services/dashboard.service'
import { getBrainCurrent } from '../../services/progress.service'
import { useAuthStore } from '../../stores/auth.store'
import { BrainStatus } from '../../components/brain-status'
import { SkeletonLoader } from '../../components/ui/SkeletonLoader'
import { QueryKeys } from '../../lib/query-keys'

/**
 * Home screen — displays greeting, next challenge card, daily goal progress,
 * and the cognitive brain status summary.
 */
export default function HomeScreen() {
  const router = useRouter()
  const user = useAuthStore((s) => s.user)

  const { data: dashboard, isLoading: dashLoading } = useQuery({
    queryKey: QueryKeys.dashboard,
    queryFn: getDashboard,
  })

  const { data: brain, isLoading: brainLoading } = useQuery({
    queryKey: QueryKeys.brainCurrent,
    queryFn: getBrainCurrent,
  })

  return (
    <ScrollView className="flex-1 bg-zinc-950" contentContainerClassName="px-4 py-6 gap-6">
      {/* Greeting */}
      <View className="gap-1">
        <Text className="text-zinc-500 text-sm">Olá,</Text>
        <Text className="text-zinc-100 text-2xl font-bold">{user?.name ?? '—'}</Text>
      </View>

      {/* Next Challenge Card */}
      <View className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 gap-3">
        <Text className="text-zinc-500 text-xs uppercase tracking-wide">Próximo Desafio</Text>
        {dashLoading ? (
          <View className="gap-2">
            <SkeletonLoader width="60%" height={18} />
            <SkeletonLoader width="40%" height={14} />
          </View>
        ) : (
          <View className="gap-1">
            <Text className="text-zinc-100 font-semibold text-base">
              {dashboard?.nextChallenge.subject ?? '—'}
            </Text>
            <Text className="text-zinc-500 text-sm">
              {dashboard?.nextChallenge.topic ?? '—'}
            </Text>
          </View>
        )}
        <TouchableOpacity
          className="bg-indigo-500 h-12 rounded-xl items-center justify-center"
          onPress={() => router.push('/(app)/desafio')}
          accessibilityRole="button"
          accessibilityLabel="Iniciar desafio"
        >
          <Text className="text-white font-bold text-base">Iniciar Desafio</Text>
        </TouchableOpacity>
      </View>

      {/* Daily Goal */}
      {dashLoading ? (
        <SkeletonLoader width="100%" height={60} rounded />
      ) : dashboard ? (
        <View className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 gap-2">
          <View className="flex-row justify-between">
            <Text className="text-zinc-400 text-sm">Meta Diária</Text>
            <Text className="text-zinc-400 text-sm">
              {dashboard.dailyGoalProgress}/{dashboard.dailyGoalTarget}
            </Text>
          </View>
          <View className="h-2 bg-zinc-800 rounded-full overflow-hidden">
            <View
              className="h-full bg-indigo-500 rounded-full"
              style={{
                width: `${Math.min(100, (dashboard.dailyGoalProgress / dashboard.dailyGoalTarget) * 100)}%`,
              }}
            />
          </View>
        </View>
      ) : null}

      {/* Brain Status */}
      {brainLoading ? (
        <SkeletonLoader width="100%" height={220} rounded />
      ) : brain ? (
        <BrainStatus
          metrics={brain}
          streakDays={brain.streakDays}
          totalXP={brain.totalXP}
        />
      ) : null}
    </ScrollView>
  )
}
