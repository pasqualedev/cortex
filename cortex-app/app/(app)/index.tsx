import { ScrollView, View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { useRouter } from 'expo-router'
import { useQuery } from '@tanstack/react-query'
import { getDashboard } from '../../services/dashboard.service'
import { useAuthStore } from '../../stores/auth.store'
import { BrainStatus } from '../../components/brain-status'
import { SkeletonLoader } from '../../components/ui/SkeletonLoader'
import { QueryKeys } from '../../lib/query-keys'
import { colors, radius, spacing, font } from '../../lib/theme'

export default function HomeScreen() {
  const router = useRouter()
  const user = useAuthStore((s) => s.user)

  const { data: dashboard, isLoading } = useQuery({
    queryKey: QueryKeys.dashboard,
    queryFn: getDashboard,
  })

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
      {/* Greeting */}
      <View style={styles.greetingContainer}>
        <Text style={styles.greetingLabel}>Olá,</Text>
        <Text style={styles.greetingName}>{user?.name ?? '—'}</Text>
      </View>

      {/* Challenge CTA */}
      <View style={styles.card}>
        <Text style={styles.cardLabel}>Próximo Desafio</Text>
        <Text style={styles.cardSubtext}>Continue treinando seu cérebro hoje.</Text>
        <TouchableOpacity
          style={styles.ctaButton}
          onPress={() => router.push('/(app)/desafio')}
          accessibilityRole="button"
          accessibilityLabel="Iniciar desafio"
        >
          <Text style={styles.ctaButtonText}>Iniciar Desafio</Text>
        </TouchableOpacity>
      </View>

      {/* Weekly Activity */}
      {isLoading ? (
        <SkeletonLoader width="100%" height={80} rounded />
      ) : dashboard ? (
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Atividade da Semana</Text>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {dashboard.recentActivity.questionsThisWeek}
              </Text>
              <Text style={styles.statUnit}>questões</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {dashboard.recentActivity.correctThisWeek}
              </Text>
              <Text style={styles.statUnit}>acertos</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {dashboard.recentActivity.sessionsThisWeek}
              </Text>
              <Text style={styles.statUnit}>sessões</Text>
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

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: colors.bg950,
  },
  scrollContent: {
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[6],
    gap: spacing[6],
  },
  greetingContainer: {
    gap: spacing[1],
  },
  greetingLabel: {
    color: colors.text500,
    fontSize: font.sm,
  },
  greetingName: {
    color: colors.text100,
    fontSize: font['2xl'],
    fontWeight: 'bold',
  },
  card: {
    backgroundColor: colors.bg900,
    borderWidth: 1,
    borderColor: colors.bg800,
    borderRadius: radius.lg,
    padding: spacing[4],
    gap: spacing[3],
  },
  cardLabel: {
    color: colors.text500,
    fontSize: font.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  cardSubtext: {
    color: colors.text400,
    fontSize: font.sm,
  },
  ctaButton: {
    backgroundColor: colors.indigo500,
    height: 48,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaButtonText: {
    color: colors.white,
    fontWeight: 'bold',
    fontSize: font.base,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
    gap: spacing[0.5],
  },
  statValue: {
    color: colors.text100,
    fontWeight: 'bold',
    fontSize: font.lg,
  },
  statUnit: {
    color: colors.text500,
    fontSize: font.xs,
  },
})
