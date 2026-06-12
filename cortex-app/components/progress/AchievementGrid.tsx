import { View, Text } from 'react-native'
import type { AchievementsResponse } from '../../types/domain'

interface AchievementGridProps {
  readonly data: AchievementsResponse
}

/** Grid of unlocked achievements + locked achievements with progress. */
export const AchievementGrid = ({ data }: AchievementGridProps) => (
  <View className="gap-3">
    <Text className="text-zinc-100 font-semibold text-base">Conquistas</Text>
    <View className="flex-row flex-wrap gap-2">
      {data.unlocked.map((a) => (
        <View key={a.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 items-center gap-1 w-[30%]">
          <Text className="text-2xl">{a.icon}</Text>
          <Text className="text-zinc-100 text-xs text-center font-medium">{a.name}</Text>
          <Text className="text-emerald-400 text-xs">Desbloqueada</Text>
        </View>
      ))}
      {data.locked.map((a) => (
        <View key={a.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 items-center gap-1 w-[30%] opacity-50">
          <Text className="text-2xl grayscale">{a.icon}</Text>
          <Text className="text-zinc-400 text-xs text-center">{a.name}</Text>
          <Text className="text-zinc-600 text-xs">{a.progress}/{a.threshold}</Text>
        </View>
      ))}
    </View>
  </View>
)
