import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native'
import { colors, font, spacing, radius } from '../../lib/theme'

export type OptionState = 'idle' | 'selected' | 'correct' | 'wrong'

interface AnswerOptionProps {
  readonly optionKey: string
  readonly text: string
  readonly state: OptionState
  readonly onPress: () => void
  readonly disabled?: boolean
}

/** Single answer option button with visual state feedback. */
export const AnswerOption = ({ optionKey, text, state, onPress, disabled = false }: AnswerOptionProps) => (
  <TouchableOpacity
    style={[
      styles.container,
      containerStateStyles[state],
      disabled && styles.containerDisabled,
    ]}
    onPress={onPress}
    disabled={disabled}
    accessibilityRole="radio"
    accessibilityLabel={`Opção ${optionKey}: ${text}`}
    accessibilityState={{ checked: state === 'selected' || state === 'correct' }}
  >
    <Text style={[styles.keyText, keyStateStyles[state]]}>{optionKey}</Text>
    <Text style={[styles.optionText, textStateStyles[state]]}>{text}</Text>
  </TouchableOpacity>
)

const containerStateStyles: Record<OptionState, ViewStyle> = {
  idle:     { borderColor: colors.bg800,      backgroundColor: colors.bg900 },
  selected: { borderColor: colors.indigo500,  backgroundColor: colors.indigo500_10 },
  correct:  { borderColor: colors.emerald500, backgroundColor: colors.emerald500_10 },
  wrong:    { borderColor: colors.red500,     backgroundColor: colors.red500_10 },
}

const keyStateStyles: Record<OptionState, TextStyle> = {
  idle:     { color: colors.text500 },
  selected: { color: colors.indigo400 },
  correct:  { color: colors.emerald400 },
  wrong:    { color: colors.red400 },
}

const textStateStyles: Record<OptionState, TextStyle> = {
  idle:     { color: colors.text100 },
  selected: { color: colors.text100 },
  correct:  { color: colors.text100 },
  wrong:    { color: colors.text100 },
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing[3],
    padding: spacing[4],
    borderRadius: radius.md,
    borderWidth: 1,
  },
  containerDisabled: {
    opacity: 0.7,
  },
  keyText: {
    fontWeight: '700',
    fontSize: font.sm,
    width: spacing[5],
  },
  optionText: {
    flex: 1,
    fontSize: font.sm,
    lineHeight: 20,
  },
})
