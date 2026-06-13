import { useEffect, useState } from 'react'
import { Text } from 'react-native'
import type { StyleProp, TextStyle } from 'react-native'

interface CountUpProps {
  /** Target number to count up to */
  readonly to: number
  /** Total animation duration in ms */
  readonly duration?: number
  /** Delay before starting in ms */
  readonly delay?: number
  /** Text appended after the number (e.g. "%" or " dias") */
  readonly suffix?: string
  /** Text prepended before the number (e.g. "+") */
  readonly prefix?: string
  readonly style?: StyleProp<TextStyle>
}

/**
 * Animates a number counting from 0 to `to` over `duration` ms.
 * Uses setInterval for simplicity — no Reanimated required.
 */
export const CountUp = ({
  to,
  duration = 800,
  delay = 0,
  suffix = '',
  prefix = '',
  style,
}: CountUpProps) => {
  const [value, setValue] = useState(0)

  useEffect(() => {
    const STEPS = 40
    const intervalMs = duration / STEPS
    const increment = to / STEPS
    let current = 0

    const start = () => {
      const timer = setInterval(() => {
        current += increment
        if (current >= to) {
          setValue(to)
          clearInterval(timer)
        } else {
          setValue(Math.floor(current))
        }
      }, intervalMs)
      return timer
    }

    if (delay > 0) {
      const delayTimer = setTimeout(() => start(), delay)
      return () => clearTimeout(delayTimer)
    }

    const timer = start()
    return () => clearInterval(timer)
  }, [to, duration, delay])

  return (
    <Text style={style}>
      {prefix}{value}{suffix}
    </Text>
  )
}
