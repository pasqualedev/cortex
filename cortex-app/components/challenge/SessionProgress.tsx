import { View, Text } from 'react-native'

interface SessionProgressProps {
  readonly current: number   // 1-based
  readonly total: number
}

/** Progress bar + counter for the current challenge session. */
export const SessionProgress = ({ current, total }: SessionProgressProps) => (
  <View className="gap-2">
    <View className="flex-row justify-between">
      <Text className="text-zinc-500 text-sm">Questão {current} de {total}</Text>
    </View>
    <View className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
      <View
        className="h-full bg-indigo-500 rounded-full"
        style={{ width: `${(current / total) * 100}%` }}
      />
    </View>
  </View>
)
