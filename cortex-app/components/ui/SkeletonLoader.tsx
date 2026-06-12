import { useEffect, useRef } from 'react'
import { Animated, ViewStyle } from 'react-native'

interface SkeletonLoaderProps {
  readonly width?: number | string
  readonly height?: number
  readonly rounded?: boolean
  readonly style?: ViewStyle
}

/** Pulsing skeleton placeholder. Use same dimensions as the real content. */
export const SkeletonLoader = ({ width = '100%', height = 20, rounded = false, style }: SkeletonLoaderProps) => {
  const opacity = useRef(new Animated.Value(0.4)).current

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.4, duration: 600, useNativeDriver: true }),
      ]),
    )
    anim.start()
    return () => anim.stop()
  }, [opacity])

  return (
    <Animated.View
      style={[
        { width: width as number, height, opacity, backgroundColor: '#27272a', borderRadius: rounded ? 999 : 8 },
        style,
      ]}
    />
  )
}
