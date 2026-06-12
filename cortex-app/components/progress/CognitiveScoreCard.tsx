import { View, Text, StyleSheet } from 'react-native'
import type { BrainMetrics } from '../../types/domain'
import { colors, spacing, font, radius } from '../../lib/theme'

interface CognitiveScoreCardProps {
  readonly metrics: BrainMetrics
}

const SCORE_ROWS: readonly { label: string; key: keyof BrainMetrics }[] = [
  { label: 'Energia Neural', key: 'energiaNeuralScore' },
  { label: 'Memória',        key: 'memoriaScore' },
  { label: 'Lógica',         key: 'logicaScore' },
  { label: 'Interpretação',  key: 'interpretacaoScore' },
  { label: 'Ciências',       key: 'cienciasScore' },
]

/** Card showing estimated ENEM score and per-attribute cognitive scores. */
export const CognitiveScoreCard = ({ metrics }: CognitiveScoreCardProps) => (
  <View style={styles.card}>
    <View style={styles.scoreHeader}>
      <Text style={styles.scoreLabel}>Nota Estimada ENEM</Text>
      <Text style={styles.scoreValue}>{metrics.estimatedScore.toFixed(0)}</Text>
    </View>
    <View style={styles.rowsContainer}>
      {SCORE_ROWS.map(({ label, key }) => (
        <View key={key} style={styles.scoreRow}>
          <Text style={styles.rowLabel}>{label}</Text>
          <Text style={styles.rowValue}>{(metrics[key] as number).toFixed(1)}</Text>
        </View>
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
  scoreHeader: {
    alignItems: 'center',
    gap: spacing[1],
  },
  scoreLabel: {
    color: colors.text500,
    fontSize: font.xs,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  scoreValue: {
    color: colors.indigo400,
    fontSize: 36,
    fontWeight: 'bold',
  },
  rowsContainer: {
    gap: spacing[2],
  },
  scoreRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  rowLabel: {
    color: colors.text400,
    fontSize: font.sm,
  },
  rowValue: {
    color: colors.text100,
    fontSize: font.sm,
    fontWeight: '600',
  },
})
