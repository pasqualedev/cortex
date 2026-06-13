import { useEffect } from 'react'
import { View, Text, StyleSheet, SafeAreaView } from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
  FadeIn,
} from 'react-native-reanimated'
import { CountUp } from '../ui/CountUp'
import { Button } from '../ui/Button'
import { colors, font, spacing, radius } from '../../lib/theme'

interface StepStreakProps {
  readonly streakDays: number
  readonly onHome: () => void
  readonly onNewChallenge: () => void
}

/**
 * Result step 3: streak celebration with flame pulse, day count-up,
 * and cascading 7-day mini calendar.
 */
export const StepStreak = ({ streakDays, onHome, onNewChallenge }: StepStreakProps) => {
  const scale = useSharedValue(0.5)
  const opacity = useSharedValue(0)

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 300 })
    scale.value = withSequence(
      withSpring(1.2, { damping: 10, stiffness: 200 }),
      withTiming(1.0, { duration: 150 }),
      withTiming(1.2, { duration: 150 }),
      withTiming(1.0, { duration: 150 }),
    )
  }, [])

  const flameStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }))

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Animated.Text style={[styles.flameEmoji, flameStyle]}>🔥</Animated.Text>

        <View style={styles.countContainer}>
          <CountUp
            to={streakDays}
            duration={800}
            style={styles.streakNumber}
          />
          <Text style={styles.streakLabel}>
            {streakDays === 1 ? 'dia de sequência' : 'dias de sequência'}
          </Text>
        </View>

        <View style={styles.calendar}>
          {Array.from({ length: 7 }).map((_, i) => {
            const isActive = i < streakDays
            const isToday = i === Math.min(streakDays - 1, 6)
            return (
              <Animated.View
                key={i}
                entering={FadeIn.delay(i * 80).duration(200)}
                style={[
                  styles.calendarCell,
                  isActive ? styles.calendarCellActive : styles.calendarCellInactive,
                  isToday ? styles.calendarCellToday : null,
                ]}
              >
                <Text style={styles.calendarEmoji}>{isActive ? '🔥' : '·'}</Text>
              </Animated.View>
            )
          })}
        </View>

        {streakDays > 0 ? (
          <Animated.Text entering={FadeIn.delay(700).duration(300)} style={styles.motivational}>
            Continue amanhã para não perder!
          </Animated.Text>
        ) : null}

        <View style={styles.buttons}>
          <Button label="Voltar para Home" onPress={onHome} variant="primary" />
          <Button label="Novo Desafio" onPress={onNewChallenge} variant="secondary" />
        </View>
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
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing[4],
    gap: spacing[6],
  },
  flameEmoji: {
    fontSize: 72,
  },
  countContainer: {
    alignItems: 'center',
    gap: spacing[1],
  },
  streakNumber: {
    color: colors.orange500,
    fontSize: font['4xl'],
    fontWeight: 'bold',
    lineHeight: font['4xl'] * 1.1,
  },
  streakLabel: {
    color: colors.text400,
    fontSize: font.base,
  },
  calendar: {
    flexDirection: 'row',
    gap: spacing[1.5],
  },
  calendarCell: {
    width: 36,
    height: 36,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  calendarCellActive: {
    backgroundColor: colors.orange500_10,
  },
  calendarCellInactive: {
    backgroundColor: colors.bg800,
  },
  calendarCellToday: {
    borderWidth: 1,
    borderColor: colors.orange500,
  },
  calendarEmoji: {
    fontSize: font.sm,
  },
  motivational: {
    color: colors.text500,
    fontSize: font.sm,
    textAlign: 'center',
  },
  buttons: {
    width: '100%',
    gap: spacing[3],
  },
})
