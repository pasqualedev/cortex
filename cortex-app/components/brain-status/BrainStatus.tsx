import { View, Text, StyleSheet } from 'react-native'
import { AttributeBar } from './AttributeBar'
import { colors, font, spacing, radius } from '../../lib/theme'
import type { BrainMetrics } from '../../types/domain'

interface AttributeConfig {
  readonly label: string
  readonly color: string
  readonly value: (metrics: BrainMetrics) => number
}

const ATTRIBUTE_CONFIG: readonly AttributeConfig[] = [
  { label: 'Energia Neural', color: colors.indigo500,  value: (m) => m.energiaNeuralScore },
  { label: 'Memória',        color: colors.violet500,  value: (m) => m.memoriaScore },
  { label: 'Lógica',         color: colors.blue500,    value: (m) => m.logicaScore },
  { label: 'Interpretação',  color: colors.emerald500, value: (m) => m.interpretacaoScore },
  { label: 'Ciências',       color: colors.rose500,    value: (m) => m.cienciasScore },
]

interface BrainStatusProps {
  readonly metrics: BrainMetrics
  readonly streakDays: number
  readonly totalXP: number
}

/** Full cognitive status card: streak, XP, overall score, and 5 attribute bars. */
export const BrainStatus = ({ metrics, streakDays, totalXP }: BrainStatusProps) => (
  <View style={styles.card}>
    <View style={styles.header}>
      <Text style={styles.title}>Status Cognitivo</Text>
      <Text style={styles.score}>{metrics.estimatedScore.toFixed(1)} pts</Text>
    </View>
    <View style={styles.statsRow}>
      <View style={styles.statItem}>
        <Text style={styles.statValue}>{streakDays}</Text>
        <Text style={styles.statLabel}>dias seguidos</Text>
      </View>
      <View style={styles.statItem}>
        <Text style={styles.statValue}>{totalXP}</Text>
        <Text style={styles.statLabel}>XP total</Text>
      </View>
    </View>
    <View style={styles.barsContainer}>
      {ATTRIBUTE_CONFIG.map((config) => (
        <AttributeBar
          key={config.label}
          label={config.label}
          value={config.value(metrics)}
          color={config.color}
        />
      ))}
    </View>
  </View>
)

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.bg900,
    borderWidth: 1,
    borderColor: colors.bg800,
    borderRadius: radius.lg,
    padding: spacing[4],
    gap: spacing[4],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    color: colors.text100,
    fontWeight: '600',
    fontSize: font.base,
  },
  score: {
    color: colors.indigo400,
    fontSize: font.sm,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing[4],
  },
  statItem: {
    alignItems: 'center',
    gap: spacing[0.5],
  },
  statValue: {
    color: colors.text100,
    fontWeight: '700',
    fontSize: font.lg,
  },
  statLabel: {
    color: colors.text500,
    fontSize: font.xs,
  },
  barsContainer: {
    gap: spacing[2],
  },
})
