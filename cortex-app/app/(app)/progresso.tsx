import { ScrollView, View, Text, StyleSheet } from 'react-native'
import { useQuery } from '@tanstack/react-query'
import { getBrainCurrent, getAchievements } from '../../services/progress.service'
import { CognitiveScoreCard } from '../../components/progress/CognitiveScoreCard'
import { AchievementGrid } from '../../components/progress/AchievementGrid'
import { SkeletonLoader } from '../../components/ui/SkeletonLoader'
import { QueryKeys } from '../../lib/query-keys'
import { colors, spacing, font } from '../../lib/theme'

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
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Progresso</Text>

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

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: colors.bg950,
  },
  content: {
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[6],
    gap: spacing[6],
  },
  title: {
    color: colors.text100,
    fontSize: font['2xl'],
    fontWeight: 'bold',
  },
})
