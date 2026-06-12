import { ScrollView, View, Text } from 'react-native'
import { useQuery } from '@tanstack/react-query'
import { getBrainCurrent, getAchievements } from '../../services/progress.service'
import { CognitiveScoreCard } from '../../components/progress/CognitiveScoreCard'
import { AchievementGrid } from '../../components/progress/AchievementGrid'
import { SkeletonLoader } from '../../components/ui/SkeletonLoader'
import { QueryKeys } from '../../lib/query-keys'

export default function ProgressoScreen() {
  const { data: brain, isLoading: brainLoading } = useQuery({
    queryKey: QueryKeys.brainCurrent,
    queryFn: getBrainCurrent,
  })

  const { data: achievements, isLoading: achievementsLoading } = useQuery({
    queryKey: QueryKeys.achievements,
    queryFn: getAchievements,
  })

  return (
    <ScrollView className="flex-1 bg-zinc-950" contentContainerClassName="px-4 py-6 gap-6">
      <Text className="text-zinc-100 text-2xl font-bold">Progresso</Text>

      {brainLoading ? (
        <SkeletonLoader width="100%" height={200} rounded />
      ) : brain ? (
        <CognitiveScoreCard metrics={brain} />
      ) : null}

      {achievementsLoading ? (
        <SkeletonLoader width="100%" height={120} rounded />
      ) : achievements ? (
        <AchievementGrid data={achievements} />
      ) : null}
    </ScrollView>
  )
}
