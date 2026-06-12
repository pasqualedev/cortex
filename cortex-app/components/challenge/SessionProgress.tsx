import { View, Text, StyleSheet } from 'react-native'
import { colors, font, spacing, radius } from '../../lib/theme'

interface SessionProgressProps {
  readonly current: number   // 1-based
  readonly total: number
}

/** Progress bar + counter for the current challenge session. */
export const SessionProgress = ({ current, total }: SessionProgressProps) => (
  <View style={styles.container}>
    <View style={styles.labelRow}>
      <Text style={styles.label}>Questão {current} de {total}</Text>
    </View>
    <View style={styles.track}>
      <View
        style={[styles.fill, { width: `${(current / total) * 100}%` as `${number}%` }]}
      />
    </View>
  </View>
)

const styles = StyleSheet.create({
  container: {
    gap: spacing[2],
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  label: {
    color: colors.text500,
    fontSize: font.sm,
  },
  track: {
    height: spacing[1.5],
    backgroundColor: colors.bg800,
    borderRadius: radius.full,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    backgroundColor: colors.indigo500,
    borderRadius: radius.full,
  },
})
