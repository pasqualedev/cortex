import { View, Text, ScrollView } from 'react-native'
import { useRouter } from 'expo-router'
import { Button } from '../../../components/ui/Button'

/**
 * ResultadoScreen — post-challenge results screen.
 * Shown after a challenge session is completed. Provides navigation
 * back to home or to start a new challenge.
 */
export default function ResultadoScreen() {
  const router = useRouter()

  return (
    <ScrollView className="flex-1 bg-zinc-950" contentContainerClassName="px-4 py-8 gap-6 items-center">
      <View className="items-center gap-2">
        <Text className="text-5xl">🧠</Text>
        <Text className="text-zinc-100 text-2xl font-bold">Desafio Concluído!</Text>
        <Text className="text-zinc-500 text-sm text-center">
          Continue praticando para fortalecer seu cérebro.
        </Text>
      </View>
      <Button
        label="Voltar para Home"
        onPress={() => router.replace('/(app)')}
        variant="primary"
      />
      <Button
        label="Novo Desafio"
        onPress={() => router.replace('/(app)/desafio')}
        variant="secondary"
      />
    </ScrollView>
  )
}
