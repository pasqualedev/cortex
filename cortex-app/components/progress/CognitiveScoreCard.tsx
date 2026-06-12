import { View, Text } from 'react-native'
import type { BrainMetrics } from '../../types/domain'

interface CognitiveScoreCardProps {
  readonly metrics: BrainMetrics
}

const SCORE_ROWS: readonly { label: string; key: keyof BrainMetrics }[] = [
  { label: 'Energia Neural', key: 'energiaNeuralScore' },
  { label: 'Memória',        key: 'memoriaScore' },
  { label: 'Lógica',         key: 'logicaScore' },
  { label: 'Interpretação',  key: 'interpretacaoScore' },
  { label: 'Ciências',       key: 'cienciasScore' },
]

/** Card showing estimated ENEM score and per-attribute cognitive scores. */
export const CognitiveScoreCard = ({ metrics }: CognitiveScoreCardProps) => (
  <View className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 gap-4">
    <View className="items-center gap-1">
      <Text className="text-zinc-500 text-xs uppercase tracking-wide">Nota Estimada ENEM</Text>
      <Text className="text-indigo-400 text-4xl font-bold">{metrics.estimatedScore.toFixed(0)}</Text>
    </View>
    <View className="gap-2">
      {SCORE_ROWS.map(({ label, key }) => (
        <View key={key} className="flex-row justify-between">
          <Text className="text-zinc-400 text-sm">{label}</Text>
          <Text className="text-zinc-100 text-sm font-semibold">{(metrics[key] as number).toFixed(1)}</Text>
        </View>
      ))}
    </View>
  </View>
)
