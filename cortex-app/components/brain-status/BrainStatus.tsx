import { View, Text } from 'react-native'
import { AttributeBar } from './AttributeBar'
import type { BrainMetrics } from '../../types/domain'
import type { DashboardData } from '../../types/domain'

interface AttributeConfig {
  readonly label: string
  readonly color: string
  readonly value: (metrics: BrainMetrics) => number
}

const ATTRIBUTE_CONFIG: readonly AttributeConfig[] = [
  { label: 'Energia Neural', color: 'bg-indigo-500', value: (m) => m.energiaNeuralScore },
  { label: 'Memória',        color: 'bg-violet-500', value: (m) => m.memoriaScore },
  { label: 'Lógica',         color: 'bg-blue-500',   value: (m) => m.logicaScore },
  { label: 'Interpretação',  color: 'bg-emerald-500', value: (m) => m.interpretacaoScore },
  { label: 'Ciências',       color: 'bg-rose-500',   value: (m) => m.cienciasScore },
]

interface BrainStatusProps {
  readonly metrics: BrainMetrics
  readonly streakDays: number
  readonly totalXP: number
}

/** Full cognitive status card: streak, XP, overall score, and 5 attribute bars. */
export const BrainStatus = ({ metrics, streakDays, totalXP }: BrainStatusProps) => (
  <View className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 gap-4">
    <View className="flex-row justify-between items-center">
      <Text className="text-zinc-100 font-semibold text-base">Status Cognitivo</Text>
      <Text className="text-indigo-400 text-sm">{metrics.estimatedScore.toFixed(1)} pts</Text>
    </View>
    <View className="flex-row gap-4">
      <View className="items-center gap-0.5">
        <Text className="text-zinc-100 font-bold text-lg">{streakDays}</Text>
        <Text className="text-zinc-500 text-xs">dias seguidos</Text>
      </View>
      <View className="items-center gap-0.5">
        <Text className="text-zinc-100 font-bold text-lg">{totalXP}</Text>
        <Text className="text-zinc-500 text-xs">XP total</Text>
      </View>
    </View>
    <View className="gap-2">
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
