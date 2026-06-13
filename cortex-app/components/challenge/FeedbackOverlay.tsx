import { View, Text, StyleSheet } from 'react-native'
import Animated, { ZoomIn, FadeInRight, FadeInDown } from 'react-native-reanimated'
import { Button } from '../ui/Button'
import { colors, font, spacing } from '../../lib/theme'
import type { AttemptResult } from '../../types/domain'

interface FeedbackOverlayProps {
  readonly result: AttemptResult
  readonly isLast: boolean
  readonly consecutiveCorrect: number
  readonly onNext: () => void
}

/** Bottom sheet shown after answering: animated icon, XP entry, combo badge. */
export const FeedbackOverlay = ({
  result,
  isLast,
  consecutiveCorrect,
  onNext,
}: FeedbackOverlayProps) => {
  const isCorrect = result.isCorrect
  const borderColor = isCorrect ? colors.emerald500 : colors.red500

  return (
    <View style={[styles.container, { borderTopColor: borderColor }]}>
      <View style={styles.topRow}>
        <Animated.Text
          entering={ZoomIn.duration(300)}
          style={[styles.resultIcon, isCorrect ? styles.correctIcon : styles.wrongIcon]}
        >
          {isCorrect ? '✓' : '✗'}
        </Animated.Text>

        <Animated.Text
          entering={FadeInRight.delay(150).duration(300)}
          style={styles.xpText}
        >
          +{result.xpEarned} XP
        </Animated.Text>

        {consecutiveCorrect >= 2 ? (
          <Animated.View
            entering={FadeInDown.delay(100).duration(300)}
            style={styles.comboBadge}
          >
            <Text style={styles.comboText}>🔥 Combo ×{consecutiveCorrect}</Text>
          </Animated.View>
        ) : null}
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
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.bg900,
    borderTopWidth: 3,
    paddingHorizontal: spacing[4],
    paddingTop: spacing[4],
    paddingBottom: spacing[8],
    gap: spacing[3],
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    flexWrap: 'wrap',
  },
  resultIcon: {
    fontSize: font['2xl'],
    fontWeight: '800',
  },
  correctIcon: {
    color: colors.emerald400,
  },
  wrongIcon: {
    color: colors.red400,
  },
  xpText: {
    color: colors.indigo400,
    fontSize: font.base,
    fontWeight: '700',
  },
  comboBadge: {
    backgroundColor: colors.amber500_10,
    borderRadius: 20,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1],
  },
  comboText: {
    color: colors.amber500,
    fontSize: font.sm,
    fontWeight: '600',
  },
  explanation: {
    color: colors.text400,
    fontSize: font.sm,
    lineHeight: 20,
  },
})
