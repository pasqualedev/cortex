import { TouchableOpacity, Text, View } from 'react-native'

type OptionState = 'idle' | 'selected' | 'correct' | 'wrong'

interface AnswerOptionProps {
  readonly optionKey: string
  readonly text: string
  readonly state: OptionState
  readonly onPress: () => void
  readonly disabled?: boolean
}

const STATE_STYLES: Record<OptionState, { container: string; key: string; text: string }> = {
  idle:     { container: 'border-zinc-800 bg-zinc-900',      key: 'text-zinc-500',  text: 'text-zinc-100' },
  selected: { container: 'border-indigo-500 bg-indigo-500/10', key: 'text-indigo-400', text: 'text-zinc-100' },
  correct:  { container: 'border-emerald-500 bg-emerald-500/10', key: 'text-emerald-400', text: 'text-emerald-100' },
  wrong:    { container: 'border-red-500 bg-red-500/10',     key: 'text-red-400',   text: 'text-red-100' },
}

/** Single answer option button with visual state feedback. */
export const AnswerOption = ({ optionKey, text, state, onPress, disabled = false }: AnswerOptionProps) => {
  const styles = STATE_STYLES[state]
  return (
    <TouchableOpacity
      className={`flex-row items-start gap-3 p-4 rounded-xl border ${styles.container} ${disabled ? 'opacity-70' : ''}`}
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="radio"
      accessibilityLabel={`Opção ${optionKey}: ${text}`}
      accessibilityState={{ checked: state === 'selected' || state === 'correct' }}
    >
      <Text className={`font-bold text-sm w-5 ${styles.key}`}>{optionKey}</Text>
      <Text className={`flex-1 text-sm leading-5 ${styles.text}`}>{text}</Text>
    </TouchableOpacity>
  )
}
