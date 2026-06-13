import { useEffect } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, useWindowDimensions } from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated'
import ConfettiCannon from 'react-native-confetti-cannon'
import { colors, font, spacing } from '../../lib/theme'

interface StepCelebrationProps {
  readonly totalCount: number
  readonly onAdvance: () => void
}

/**
 * Result step 1: full-screen celebration with confetti, spring emoji entry,
 * and auto-advance after 2.5s (or on tap).
 */
export const StepCelebration = ({ totalCount, onAdvance }: StepCelebrationProps) => {
  const { width } = useWindowDimensions()
  const translateY = useSharedValue(80)
  const opacity = useSharedValue(0)

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 400 })
    translateY.value = withSpring(0, { damping: 14, stiffness: 120 })

    const timer = setTimeout(onAdvance, 2500)
    return () => clearTimeout(timer)
  }, [])

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }))

  return (
    <TouchableOpacity style={styles.container} onPress={onAdvance} activeOpacity={1}>
      <ConfettiCannon
        count={80}
        origin={{ x: width / 2, y: -10 }}
        autoStart
        fadeOut
        colors={['#6366f1', '#8b5cf6', '#f59e0b', '#10b981', '#818cf8']}
      />
      <Animated.View style={[styles.content, animatedStyle]}>
        <Text style={styles.emoji}>🧠</Text>
        <Text style={styles.title}>Desafio Concluído!</Text>
        <Text style={styles.subtitle}>{totalCount} questões respondidas</Text>
        <Text style={styles.hint}>Toque para continuar</Text>
      </Animated.View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg950,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    alignItems: 'center',
    gap: spacing[3],
  },
  emoji: {
    fontSize: 72,
    marginBottom: spacing[2],
  },
  title: {
    color: colors.text100,
    fontSize: font['2xl'],
    fontWeight: 'bold',
    textAlign: 'center',
  },
  subtitle: {
    color: colors.text500,
    fontSize: font.sm,
    textAlign: 'center',
  },
  hint: {
    color: colors.indigo400,
    fontSize: font.xs,
    marginTop: spacing[4],
  },
})
