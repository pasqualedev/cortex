import { View, Text } from 'react-native'

interface BadgeProps {
  readonly label: string
  readonly color?: 'indigo' | 'zinc' | 'emerald' | 'rose'
}

const colorMap: Record<NonNullable<BadgeProps['color']>, { bg: string; text: string }> = {
  indigo:  { bg: 'bg-indigo-500/20',  text: 'text-indigo-400'  },
  zinc:    { bg: 'bg-zinc-800',        text: 'text-zinc-400'    },
  emerald: { bg: 'bg-emerald-500/20', text: 'text-emerald-400' },
  rose:    { bg: 'bg-rose-500/20',    text: 'text-rose-400'    },
}

/** Small label badge. */
export const Badge = ({ label, color = 'zinc' }: BadgeProps) => {
  const { bg, text } = colorMap[color]
  return (
    <View className={`px-2 py-0.5 rounded-full ${bg}`}>
      <Text className={`text-xs font-medium ${text}`}>{label}</Text>
    </View>
  )
}
