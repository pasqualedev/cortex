import { View, Text } from 'react-native'

interface AttributeBarProps {
  readonly label: string
  readonly value: number  // 0-100
  readonly color: string  // Tailwind color class e.g. 'bg-indigo-500'
}

/** Horizontal progress bar showing a cognitive attribute level. */
export const AttributeBar = ({ label, value, color }: AttributeBarProps) => (
  <View className="gap-1">
    <View className="flex-row justify-between">
      <Text className="text-zinc-400 text-xs">{label}</Text>
      <Text className="text-zinc-400 text-xs">{value}</Text>
    </View>
    <View className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
      <View
        className={`h-full ${color} rounded-full`}
        style={{ width: `${value}%` }}
      />
    </View>
  </View>
)
