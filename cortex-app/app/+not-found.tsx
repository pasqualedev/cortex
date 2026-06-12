import { View, Text } from 'react-native'
import { Link } from 'expo-router'

export default function NotFound() {
  return (
    <View className="flex-1 bg-zinc-950 items-center justify-center gap-4">
      <Text className="text-zinc-100 text-xl font-bold">Tela não encontrada</Text>
      <Link href="/" className="text-indigo-500 text-base">Voltar ao início</Link>
    </View>
  )
}
