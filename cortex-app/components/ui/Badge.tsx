import { View, Text, ViewStyle, TextStyle, StyleSheet } from 'react-native'
import { colors, radius, spacing, font } from '../../lib/theme'

interface BadgeProps {
  readonly label: string
  readonly color?: 'indigo' | 'zinc' | 'emerald' | 'rose'
}

type ColorKey = NonNullable<BadgeProps['color']>

const bgStyles: Record<ColorKey, ViewStyle> = {
  indigo:  { backgroundColor: colors.indigo500_20 },
  zinc:    { backgroundColor: colors.bg800 },
  emerald: { backgroundColor: colors.emerald500_10 },
  rose:    { backgroundColor: colors.red500_10 },
}

const textStyles: Record<ColorKey, TextStyle> = {
  indigo:  { color: colors.indigo400 },
  zinc:    { color: colors.text400 },
  emerald: { color: colors.emerald400 },
  rose:    { color: colors.red400 },
}

/** Small label badge. */
export const Badge = ({ label, color = 'zinc' }: BadgeProps) => (
  <View style={[styles.base, bgStyles[color]]}>
    <Text style={[styles.text, textStyles[color]]}>{label}</Text>
  </View>
)

const styles = StyleSheet.create({
  base: {
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[0.5],
    borderRadius: radius.full,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: font.xs,
    fontWeight: '500',
  },
})
