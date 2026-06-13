import { useEffect } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import Svg, { Circle } from 'react-native-svg'
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  Easing,
} from 'react-native-reanimated'
import { AttributeBar } from './AttributeBar'
import { colors, font, spacing, radius } from '../../lib/theme'
import type { BrainMetrics } from '../../types/domain'

const AnimatedCircle = Animated.createAnimatedComponent(Circle)

const RING_SIZE = 80
const RADIUS = 32
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

interface AttributeConfig {
  readonly label: string
  readonly color: string
  readonly value: (metrics: BrainMetrics) => number
}

const ATTRIBUTE_CONFIG: readonly AttributeConfig[] = [
  { label: 'Energia Neural', color: colors.indigo500,  value: (m) => m.energiaNeuralScore },
  { label: 'Memória',        color: colors.violet500,  value: (m) => m.memoriaScore },
  { label: 'Lógica',         color: colors.blue500,    value: (m) => m.logicaScore },
  { label: 'Interpretação',  color: colors.emerald500, value: (m) => m.interpretacaoScore },
  { label: 'Ciências',       color: colors.rose500,    value: (m) => m.cienciasScore },
]

interface BrainStatusProps {
  readonly metrics: BrainMetrics
  readonly streakDays: number
  readonly totalXP: number
}

/** Full cognitive status card: animated score ring, streak, XP, and 5 attribute bars. */
export const BrainStatus = ({ metrics, streakDays, totalXP }: BrainStatusProps) => {
  const strokeOffset = useSharedValue(CIRCUMFERENCE)

  useEffect(() => {
    const progress = Math.min(1, metrics.estimatedScore / 1000)
    strokeOffset.value = withTiming(CIRCUMFERENCE * (1 - progress), {
      duration: 1000,
      easing: Easing.out(Easing.cubic),
    })
  }, [metrics.estimatedScore])

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: strokeOffset.value,
  }))

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>Status Cognitivo</Text>
      </View>

      <View style={styles.scoreRow}>
        <View style={styles.ringContainer}>
          <Svg width={RING_SIZE} height={RING_SIZE} style={styles.ringSvg}>
            <Circle
              cx={RING_SIZE / 2}
              cy={RING_SIZE / 2}
              r={RADIUS}
              fill="none"
              stroke={colors.bg800}
              strokeWidth={6}
            />
            <AnimatedCircle
              cx={RING_SIZE / 2}
              cy={RING_SIZE / 2}
              r={RADIUS}
              fill="none"
              stroke={colors.indigo500}
              strokeWidth={6}
              strokeDasharray={CIRCUMFERENCE}
              strokeLinecap="round"
              animatedProps={animatedProps}
            />
          </Svg>
          <View style={styles.ringCenter}>
            <Text style={styles.ringScore}>{metrics.estimatedScore.toFixed(0)}</Text>
            <Text style={styles.ringUnit}>pts</Text>
          </View>
        </View>

        <View style={styles.scoreStats}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{streakDays}</Text>
            <Text style={styles.statLabel}>dias seguidos</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{totalXP}</Text>
            <Text style={styles.statLabel}>XP total</Text>
          </View>
        </View>
      </View>

      <View style={styles.barsContainer}>
        {ATTRIBUTE_CONFIG.map((config) => (
          <AttributeBar
            key={config.label}
            label={config.label}
            value={config.value(metrics)}
            color={config.color}
          />
        ))}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.bg900,
    borderWidth: 1,
    borderColor: colors.bg800,
    borderRadius: radius.lg,
    padding: spacing[4],
    gap: spacing[4],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    color: colors.text100,
    fontWeight: '600',
    fontSize: font.base,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[4],
  },
  ringContainer: {
    width: RING_SIZE,
    height: RING_SIZE,
    position: 'relative',
  },
  ringSvg: {
    transform: [{ rotate: '-90deg' }],
  },
  ringCenter: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringScore: {
    color: colors.text100,
    fontWeight: 'bold',
    fontSize: font.base,
  },
  ringUnit: {
    color: colors.text500,
    fontSize: font.xs,
  },
  scoreStats: {
    flex: 1,
    gap: spacing[3],
  },
  statItem: {
    gap: spacing[0.5],
  },
  statValue: {
    color: colors.text100,
    fontWeight: '700',
    fontSize: font.lg,
  },
  statLabel: {
    color: colors.text500,
    fontSize: font.xs,
  },
  barsContainer: {
    gap: spacing[2],
  },
})
