import { useEffect, useState } from 'react'
import { View, StyleSheet } from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated'
import { colors } from '../../lib/theme'

interface AnimatedProgressBarProps {
  /** 0–100 */
  readonly value: number
  readonly color: string
  /** Animation duration in ms */
  readonly duration?: number
  /** Delay before animation starts in ms */
  readonly delay?: number
  readonly height?: number
}

/**
 * Progress bar that animates from 0 to `value` on mount.
 * Uses onLayout to measure container width for accurate pixel animation.
 */
export const AnimatedProgressBar = ({
  value,
  color,
  duration = 600,
  delay = 0,
  height = 8,
}: AnimatedProgressBarProps) => {
  const [containerWidth, setContainerWidth] = useState(0)
  const progress = useSharedValue(0)

  useEffect(() => {
    if (containerWidth === 0) return
    progress.value = withDelay(
      delay,
      withTiming((value / 100) * containerWidth, {
        duration,
        easing: Easing.out(Easing.cubic),
      })
    )
  }, [containerWidth, value, delay, duration])

  const animatedStyle = useAnimatedStyle(() => ({
    width: progress.value,
  }))

  return (
    <View
      style={[styles.track, { height, borderRadius: height / 2 }]}
      onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)}
    >
      <Animated.View
        style={[
          styles.fill,
          { backgroundColor: color, height, borderRadius: height / 2 },
          animatedStyle,
        ]}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  track: {
    backgroundColor: colors.bg800,
    overflow: 'hidden',
    width: '100%',
  },
  fill: {
    position: 'absolute',
    left: 0,
    top: 0,
  },
})
