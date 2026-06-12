import { View, Text, StyleSheet } from 'react-native'
import { Button } from '../ui/Button'
import { colors, font, spacing } from '../../lib/theme'
import type { AttemptResult } from '../../types/domain'

interface FeedbackOverlayProps {
  readonly result: AttemptResult
  readonly isLast: boolean
  readonly onNext: () => void
}

/** Bottom sheet feedback shown after answering: correct/wrong + XP + explanation + next button. */
export const FeedbackOverlay = ({ result, isLast, onNext }: FeedbackOverlayProps) => (
  <View style={styles.container}>
    <View style={styles.resultRow}>
      <Text style={[styles.resultText, result.isCorrect ? styles.correctText : styles.wrongText]}>
        {result.isCorrect ? '✓ Correto!' : '✗ Incorreto'}
      </Text>
      <Text style={styles.xpText}>+{result.xpEarned} XP</Text>
    </View>
    {result.explanation ? (
      <Text style={styles.explanation}>{result.explanation}</Text>
    ) : null}
    <Button
      label={isLast ? 'Ver Resultado' : 'Próxima Questão'}
      onPress={onNext}
      variant="primary"
    />
  </View>
)

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.bg900,
    borderTopWidth: 1,
    borderTopColor: colors.bg800,
    paddingHorizontal: spacing[4],
    paddingTop: spacing[4],
    paddingBottom: spacing[8],
    gap: spacing[3],
  },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  resultText: {
    fontSize: font.base,
    fontWeight: '700',
  },
  correctText: {
    color: colors.emerald400,
  },
  wrongText: {
    color: colors.red400,
  },
  xpText: {
    color: colors.indigo400,
    fontSize: font.sm,
  },
  explanation: {
    color: colors.text400,
    fontSize: font.sm,
    lineHeight: 20,
  },
})
