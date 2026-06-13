import { useEffect, useState } from 'react'
import { View, Text, StyleSheet, SafeAreaView } from 'react-native'
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated'
import { AnimatedProgressBar } from '../ui/AnimatedProgressBar'
import { CountUp } from '../ui/CountUp'
import { Button } from '../ui/Button'
import { colors, font, spacing } from '../../lib/theme'

interface StepScoreXPProps {
  readonly xpEarned: number
  readonly correctCount: number
  readonly totalCount: number
  readonly maxCombo: number
  readonly onAdvance: () => void
}

/**
 * Result step 2: animated bars for precision, XP, and max combo.
 * Each bar appears with a 300ms stagger. "Continuar" button fades in at 650ms.
 */
export const StepScoreXP = ({
  xpEarned,
  correctCount,
  totalCount,
  maxCombo,
  onAdvance,
}: StepScoreXPProps) => {
  const [showButton, setShowButton] = useState(false)
  const precision = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0
  const comboPercent = Math.min(100, (maxCombo / 5) * 100)

  useEffect(() => {
    const timer = setTimeout(() => setShowButton(true), 650)
    return () => clearTimeout(timer)
  }, [])

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Animated.Text entering={FadeInDown.duration(300)} style={styles.title}>
          Veja seu desempenho
        </Animated.Text>

        <View style={styles.barsContainer}>
          {/* Bar 1 — Precisão (delay 0ms) */}
          <Animated.View entering={FadeInDown.delay(100).duration(300)} style={styles.barBlock}>
            <View style={styles.barHeader}>
              <Text style={styles.barLabel}>Precisão</Text>
              <CountUp to={precision} suffix="%" style={styles.barValue} />
            </View>
            <AnimatedProgressBar
              value={precision}
              color={colors.indigo500}
              duration={600}
              delay={0}
            />
            <Text style={styles.barSub}>{correctCount}/{totalCount} acertos</Text>
          </Animated.View>

          {/* Bar 2 — XP ganho (delay 300ms) */}
          <Animated.View entering={FadeInDown.delay(400).duration(300)} style={styles.barBlock}>
            <View style={styles.barHeader}>
              <Text style={styles.barLabel}>XP Ganho</Text>
              <CountUp to={xpEarned} prefix="+" style={[styles.barValue, { color: colors.violet500 }]} />
            </View>
            <AnimatedProgressBar
              value={Math.min(100, (xpEarned / 500) * 100)}
              color={colors.violet500}
              duration={600}
              delay={300}
            />
          </Animated.View>

          {/* Bar 3 — Combo (delay 600ms) */}
          <Animated.View entering={FadeInDown.delay(700).duration(300)} style={styles.barBlock}>
            <View style={styles.barHeader}>
              <Text style={styles.barLabel}>Combo Máximo</Text>
              <CountUp
                to={maxCombo}
                prefix="×"
                style={[styles.barValue, { color: colors.amber500 }]}
              />
            </View>
            <AnimatedProgressBar
              value={comboPercent}
              color={colors.amber500}
              duration={600}
              delay={600}
            />
          </Animated.View>
        </View>

        {showButton ? (
          <Animated.View entering={FadeIn.duration(300)} style={styles.buttonContainer}>
            <Button label="Continuar" onPress={onAdvance} variant="primary" />
          </Animated.View>
        ) : null}
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.bg950,
  },
  container: {
    flex: 1,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[6],
    gap: spacing[8],
    justifyContent: 'center',
  },
  title: {
    color: colors.text100,
    fontSize: font['2xl'],
    fontWeight: 'bold',
    textAlign: 'center',
  },
  barsContainer: {
    gap: spacing[6],
  },
  barBlock: {
    gap: spacing[2],
  },
  barHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  barLabel: {
    color: colors.text400,
    fontSize: font.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  barValue: {
    color: colors.text100,
    fontSize: font.lg,
    fontWeight: 'bold',
  },
  barSub: {
    color: colors.text600,
    fontSize: font.xs,
  },
  buttonContainer: {
    marginTop: spacing[4],
  },
})
