import { View, Text } from 'react-native'
import { Button } from '../ui/Button'
import type { AttemptResult } from '../../types/domain'

interface FeedbackOverlayProps {
  readonly result: AttemptResult
  readonly isLast: boolean
  readonly onNext: () => void
}

/** Bottom sheet feedback shown after answering: correct/wrong + XP + explanation + next button. */
export const FeedbackOverlay = ({ result, isLast, onNext }: FeedbackOverlayProps) => (
  <View className="bg-zinc-900 border-t border-zinc-800 px-4 pt-4 pb-8 gap-3">
    <View className="flex-row items-center gap-2">
      <Text className={`text-base font-bold ${result.isCorrect ? 'text-emerald-400' : 'text-red-400'}`}>
        {result.isCorrect ? '✓ Correto!' : '✗ Incorreto'}
      </Text>
      <Text className="text-indigo-400 text-sm">+{result.xpEarned} XP</Text>
    </View>
    {result.explanation ? (
      <Text className="text-zinc-400 text-sm leading-5">{result.explanation}</Text>
    ) : null}
    <Button
      label={isLast ? 'Ver Resultado' : 'Próxima Questão'}
      onPress={onNext}
      variant="primary"
    />
  </View>
)
