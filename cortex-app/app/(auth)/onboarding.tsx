import { useState } from 'react'
import { View, Text, ScrollView, TouchableOpacity } from 'react-native'
import { useRouter } from 'expo-router'
import { useMutation } from '@tanstack/react-query'
import { completeOnboarding } from '../../services/user.service'
import { Button } from '../../components/ui/Button'

const TARGET_SCORES = [500, 600, 700, 800, 900] as const

const ATTRIBUTES = [
  { label: 'Energia Neural',         color: 'text-indigo-400',  emoji: '🧠' },
  { label: 'Memória de Longo Prazo', color: 'text-violet-400',  emoji: '🔵' },
  { label: 'Lógica',                 color: 'text-blue-400',    emoji: '⚡' },
  { label: 'Interpretação',          color: 'text-emerald-400', emoji: '📖' },
  { label: 'Raciocínio Científico',  color: 'text-rose-400',    emoji: '🔬' },
]

export default function OnboardingScreen() {
  const [step, setStep] = useState(0)
  const [selectedScore, setSelectedScore] = useState<number | null>(null)
  const router = useRouter()

  const mutation = useMutation({
    mutationFn: async () => {
      await completeOnboarding(selectedScore!)
    },
    onSuccess: () => router.replace('/(app)'),
  })

  const StepIndicator = ({ current }: { current: number }) => (
    <View className="flex-row gap-2 justify-center">
      {[0, 1, 2].map((i) => (
        <View key={i} className={`w-2 h-2 rounded-full ${i === current ? 'bg-indigo-500' : 'bg-zinc-700'}`} />
      ))}
    </View>
  )

  if (step === 0) return (
    <View className="flex-1 bg-zinc-950 px-6 justify-center items-center gap-8">
      <View className="w-full h-48 items-center justify-center">
        <Text className="text-8xl">🧠</Text>
      </View>
      <Text className="text-zinc-100 text-2xl font-bold text-center">Seu cérebro está pronto para evoluir</Text>
      <Text className="text-zinc-400 text-base text-center">Cada questão do ENEM fortalece capacidades reais do seu cérebro.</Text>
      <View className="w-full gap-4">
        <Button label="Começar" onPress={() => setStep(1)} />
        <StepIndicator current={0} />
      </View>
    </View>
  )

  if (step === 1) return (
    <ScrollView className="flex-1 bg-zinc-950" contentContainerClassName="px-6 py-16 gap-8">
      <Text className="text-zinc-100 text-2xl font-bold">Você não está fazendo questões</Text>
      <Text className="text-zinc-400 text-base">Você está fortalecendo atributos do seu cérebro.</Text>
      <View className="gap-3">
        {ATTRIBUTES.map((attr) => (
          <View key={attr.label} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex-row items-center gap-3">
            <Text className="text-xl">{attr.emoji}</Text>
            <View className="flex-1">
              <Text className={`font-semibold ${attr.color}`}>{attr.label}</Text>
              <View className="h-1.5 bg-zinc-800 rounded-full mt-2" />
            </View>
            <Text className="text-zinc-600 text-xs">Bloqueado</Text>
          </View>
        ))}
      </View>
      <View className="gap-4">
        <Button label="Entendi" onPress={() => setStep(2)} />
        <StepIndicator current={1} />
      </View>
    </ScrollView>
  )

  return (
    <View className="flex-1 bg-zinc-950 px-6 py-16 gap-8">
      <Text className="text-zinc-100 text-2xl font-bold">Qual é a sua meta no ENEM?</Text>
      <Text className="text-zinc-400 text-base">Calculamos seu progresso em direção a essa nota.</Text>
      <View className="flex-row flex-wrap gap-3">
        {TARGET_SCORES.map((score, i) => (
          <TouchableOpacity
            key={score}
            className={`bg-zinc-900 border-2 rounded-xl p-4 items-center justify-center ${i === 4 ? 'w-full' : 'flex-1'} ${selectedScore === score ? 'border-indigo-500 bg-indigo-500/10' : 'border-zinc-800'}`}
            onPress={() => setSelectedScore(score)}
            accessibilityRole="button"
            accessibilityLabel={`Meta ${score} pontos`}
          >
            <Text className={`text-lg font-bold ${selectedScore === score ? 'text-indigo-400' : 'text-zinc-100'}`}>
              {score}{i === 4 ? '+' : ''}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <Button label="Continuar" onPress={() => mutation.mutate()} disabled={!selectedScore} loading={mutation.isPending} />
      <Text className="text-zinc-600 text-xs text-center">Você pode ajustar sua meta depois.</Text>
      <StepIndicator current={2} />
    </View>
  )
}
