import { View, Text, ScrollView, StyleSheet } from 'react-native'
import { useRouter } from 'expo-router'
import { Button } from '../../../components/ui/Button'
import { colors, spacing, font } from '../../../lib/theme'

/**
 * ResultadoScreen — post-challenge results screen.
 * Shown after a challenge session is completed. Provides navigation
 * back to home or to start a new challenge.
 */
export default function ResultadoScreen() {
  const router = useRouter()

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.emoji}>🧠</Text>
        <Text style={styles.title}>Desafio Concluído!</Text>
        <Text style={styles.subtitle}>
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

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: colors.bg950,
  },
  content: {
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[8],
    gap: spacing[6],
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    gap: spacing[2],
  },
  emoji: {
    fontSize: 48,
  },
  title: {
    color: colors.text100,
    fontSize: font['2xl'],
    fontWeight: 'bold',
  },
  subtitle: {
    color: colors.text500,
    fontSize: font.sm,
    textAlign: 'center',
  },
})
