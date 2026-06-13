import { useEffect } from 'react'
import { ScrollView, View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { useRouter } from 'expo-router'
import { useQuery } from '@tanstack/react-query'
import { getDashboard } from '../../services/dashboard.service'
import { useAuthStore } from '../../stores/auth.store'
import { useDailyStore } from '../../stores/daily.store'
import { BrainStatus } from '../../components/brain-status'
import { AnimatedProgressBar } from '../../components/ui/AnimatedProgressBar'
import { SkeletonLoader } from '../../components/ui/SkeletonLoader'
import { QueryKeys } from '../../lib/query-keys'
import { xpProgress, xpForLevel, xpForNextLevel } from '../../lib/xp'
import { colors, radius, spacing, font } from '../../lib/theme'

const DAILY_GOAL = 3

export default function HomeScreen() {
  const router = useRouter()
  const user = useAuthStore((s) => s.user)
  const { count: sessionsToday, isReady: dailyReady, hydrate } = useDailyStore()

  const { data: dashboard, isLoading } = useQuery({
    queryKey: QueryKeys.dashboard,
    queryFn: getDashboard,
  })

  useEffect(() => {
    hydrate()
  }, [])

  const level = dashboard?.user.level ?? user?.level ?? 1
  const xp = dashboard?.user.xp ?? user?.xp ?? 0
  const streakDays = dashboard?.user.streakDays ?? user?.streakDays ?? 0
  const xpNext = xpForNextLevel(level)
  const progressPercent = Math.round(xpProgress(xp, level) * 100)

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>

      {/* Header row */}
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.greetingLabel}>Olá,</Text>
          <Text style={styles.greetingName}>{user?.name ?? '—'}</Text>
        </View>
        <View style={styles.streakPill}>
          <Text style={styles.streakFlame}>🔥</Text>
          <Text style={styles.streakCount}>{streakDays}</Text>
          <View style={styles.pillDivider} />
          <Text style={styles.levelText}>Nv.{level}</Text>
        </View>
      </View>

      {/* Score Cognitivo */}
      {isLoading ? (
        <SkeletonLoader width="100%" height={220} rounded />
      ) : dashboard ? (
        <BrainStatus
          metrics={dashboard.brainMetrics}
          streakDays={streakDays}
          totalXP={xp}
        />
      ) : null}

      {/* XP & Nível */}
      {isLoading ? (
        <SkeletonLoader width="100%" height={64} rounded />
      ) : (
        <View style={styles.xpCard}>
          <View style={styles.xpHeader}>
            <Text style={styles.xpLabel}>Nível {level} → {level + 1}</Text>
            <Text style={styles.xpValue}>{xp} / {xpNext} XP</Text>
          </View>
          <AnimatedProgressBar
            value={progressPercent}
            color={colors.indigo500}
            duration={800}
            delay={200}
            height={6}
          />
        </View>
      )}

      {/* CTA card */}
      <View style={styles.card}>
        <Text style={styles.cardLabel}>Próximo Desafio</Text>
        <Text style={styles.cardSubtext}>Continue treinando seu cérebro hoje.</Text>

        {dailyReady ? (
          <View style={styles.goalRow}>
            <Text style={styles.goalLabel}>Meta do dia</Text>
            <View style={styles.checkboxes}>
              {Array.from({ length: DAILY_GOAL }).map((_, i) => {
                const done = i < sessionsToday
                return (
                  <View
                    key={i}
                    style={[styles.checkbox, done ? styles.checkboxDone : styles.checkboxPending]}
                  >
                    <Text style={styles.checkboxText}>{done ? '✓' : String(i + 1)}</Text>
                  </View>
                )
              })}
            </View>
          </View>
        ) : null}

        <TouchableOpacity
          style={styles.ctaButton}
          onPress={() => router.push('/(app)/desafio')}
          accessibilityRole="button"
          accessibilityLabel="Iniciar desafio"
        >
          <Text style={styles.ctaButtonText}>Iniciar Desafio</Text>
        </TouchableOpacity>
      </View>

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
    gap: spacing[4],
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  streakPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1.5],
    backgroundColor: colors.bg900,
    borderWidth: 1,
    borderColor: colors.bg800,
    borderRadius: radius.full,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1.5],
  },
  streakFlame: {
    fontSize: font.base,
  },
  streakCount: {
    color: colors.orange500,
    fontWeight: 'bold',
    fontSize: font.sm,
  },
  pillDivider: {
    width: 1,
    height: 12,
    backgroundColor: colors.bg800,
  },
  levelText: {
    color: colors.indigo400,
    fontWeight: '600',
    fontSize: font.sm,
  },
  xpCard: {
    backgroundColor: colors.bg900,
    borderWidth: 1,
    borderColor: colors.bg800,
    borderRadius: radius.lg,
    padding: spacing[4],
    gap: spacing[3],
  },
  xpHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  xpLabel: {
    color: colors.text500,
    fontSize: font.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  xpValue: {
    color: colors.indigo400,
    fontSize: font.xs,
    fontWeight: '600',
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
  goalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
  },
  goalLabel: {
    color: colors.text500,
    fontSize: font.xs,
  },
  checkboxes: {
    flexDirection: 'row',
    gap: spacing[1.5],
  },
  checkbox: {
    width: 28,
    height: 28,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxDone: {
    backgroundColor: colors.indigo500,
  },
  checkboxPending: {
    backgroundColor: colors.bg800,
    borderWidth: 1,
    borderColor: colors.bg800,
  },
  checkboxText: {
    color: colors.white,
    fontSize: font.xs,
    fontWeight: '600',
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
})
