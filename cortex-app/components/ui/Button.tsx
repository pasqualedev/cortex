import { TouchableOpacity, Text, ActivityIndicator, StyleSheet } from 'react-native'
import { colors, radius, spacing, font } from '../../lib/theme'

interface ButtonProps {
  readonly label: string
  readonly onPress: () => void
  readonly variant?: 'primary' | 'secondary' | 'ghost'
  readonly loading?: boolean
  readonly disabled?: boolean
}

/**
 * Pressable button supporting primary, secondary, and ghost variants.
 * @param label - Accessible button label and visible text.
 * @param onPress - Callback fired on press.
 * @param variant - Visual variant; defaults to 'primary'.
 * @param loading - When true renders an ActivityIndicator instead of the label.
 * @param disabled - Disables interaction and reduces opacity.
 */
export const Button = ({ label, onPress, variant = 'primary', loading = false, disabled = false }: ButtonProps) => {
  const isDisabledOrLoading = disabled || loading

  return (
    <TouchableOpacity
      style={[
        styles.base,
        variant === 'primary' && styles.variantPrimary,
        variant === 'secondary' && styles.variantSecondary,
        variant === 'ghost' && styles.variantGhost,
        isDisabledOrLoading && styles.disabled,
      ]}
      onPress={onPress}
      disabled={isDisabledOrLoading}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? colors.white : colors.indigo500} />
      ) : (
        <Text
          style={[
            styles.text,
            variant === 'primary' && styles.textPrimary,
            variant === 'secondary' && styles.textSecondary,
            variant === 'ghost' && styles.textGhost,
          ]}
        >
          {label}
        </Text>
      )}
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  base: {
    height: spacing[14],
    width: '100%',
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  variantPrimary: {
    backgroundColor: colors.indigo500,
  },
  variantSecondary: {
    backgroundColor: colors.bg800,
    borderWidth: 1,
    borderColor: colors.bg800,
  },
  variantGhost: {
    backgroundColor: 'transparent',
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    fontSize: font.base,
  },
  textPrimary: {
    color: colors.white,
    fontWeight: 'bold',
  },
  textSecondary: {
    color: colors.text100,
    fontWeight: '600',
  },
  textGhost: {
    color: colors.text400,
  },
})
