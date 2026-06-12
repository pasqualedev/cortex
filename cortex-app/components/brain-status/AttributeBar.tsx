import { View, Text, StyleSheet } from 'react-native'
import { colors, font, spacing, radius } from '../../lib/theme'

interface AttributeBarProps {
  readonly label: string
  readonly value: number  // 0-100
  readonly color: string  // Hex color value from theme
}

/** Horizontal progress bar showing a cognitive attribute level. */
export const AttributeBar = ({ label, value, color }: AttributeBarProps) => (
  <View style={styles.container}>
    <View style={styles.labelRow}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.label}>{value}</Text>
    </View>
    <View style={styles.track}>
      <View
        style={[styles.fill, { width: `${value}%` as `${number}%`, backgroundColor: color }]}
      />
    </View>
  </View>
)

const styles = StyleSheet.create({
  container: {
    gap: spacing[1],
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  label: {
    color: colors.text400,
    fontSize: font.xs,
  },
  track: {
    height: spacing[1.5],
    backgroundColor: colors.bg800,
    borderRadius: radius.full,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: radius.full,
  },
})
