import { View, ViewStyle, StyleSheet } from 'react-native'
import { colors, radius, spacing } from '../../lib/theme'

interface CardProps {
  readonly children: React.ReactNode
  readonly style?: ViewStyle
}

/**
 * Surface card following bg-zinc-900 + border-zinc-800 design token.
 * @param children - Card content.
 * @param style - Optional extra styles merged with the base card style.
 */
export const Card = ({ children, style }: CardProps) => (
  <View style={[styles.card, style]}>
    {children}
  </View>
)

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.bg900,
    borderWidth: 1,
    borderColor: colors.bg800,
    borderRadius: radius.md,
    padding: spacing[4],
  },
})
