import { useState } from 'react'
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native'
import { useRouter } from 'expo-router'
import { useMutation } from '@tanstack/react-query'
import { completeOnboarding } from '../../services/user.service'
import { Button } from '../../components/ui/Button'
import { colors, font, spacing, radius } from '../../lib/theme'

const TARGET_SCORES = [500, 600, 700, 800, 900] as const

const ATTRIBUTES = [
  { label: 'Energia Neural',         color: colors.indigo400,  emoji: '🧠' },
  { label: 'Memória de Longo Prazo', color: '#a78bfa',         emoji: '🔵' },
  { label: 'Lógica',                 color: '#60a5fa',         emoji: '⚡' },
  { label: 'Interpretação',          color: colors.emerald400, emoji: '📖' },
  { label: 'Raciocínio Científico',  color: '#fb7185',         emoji: '🔬' },
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

  /** Renders 3 dot step indicators, highlighting the current step. */
  const StepIndicator = ({ current }: { current: number }) => (
    <View style={styles.stepIndicator}>
      {[0, 1, 2].map((i) => (
        <View key={i} style={[styles.dot, i === current ? styles.dotActive : styles.dotInactive]} />
      ))}
    </View>
  )

  if (step === 0) return (
    <View style={styles.centeredScreen}>
      <View style={styles.heroBox}>
        <Text style={styles.heroEmoji}>🧠</Text>
      </View>
      <Text style={styles.headingCenter}>Seu cérebro está pronto para evoluir</Text>
      <Text style={styles.subheadingCenter}>Cada questão do ENEM fortalece capacidades reais do seu cérebro.</Text>
      <View style={styles.bottomGroup}>
        <Button label="Começar" onPress={() => setStep(1)} />
        <StepIndicator current={0} />
      </View>
    </View>
  )

  if (step === 1) return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.heading}>Você não está fazendo questões</Text>
      <Text style={styles.subheading}>Você está fortalecendo atributos do seu cérebro.</Text>
      <View style={styles.attributeList}>
        {ATTRIBUTES.map((attr) => (
          <View key={attr.label} style={styles.attributeCard}>
            <Text style={styles.attributeEmoji}>{attr.emoji}</Text>
            <View style={styles.attributeInfo}>
              <Text style={[styles.attributeLabel, { color: attr.color }]}>{attr.label}</Text>
              <View style={styles.attributeBar} />
            </View>
            <Text style={styles.attributeLocked}>Bloqueado</Text>
          </View>
        ))}
      </View>
      <View style={styles.bottomGroup}>
        <Button label="Entendi" onPress={() => setStep(2)} />
        <StepIndicator current={1} />
      </View>
    </ScrollView>
  )

  return (
    <View style={styles.screen}>
      <Text style={styles.heading}>Qual é a sua meta no ENEM?</Text>
      <Text style={styles.subheading}>Calculamos seu progresso em direção a essa nota.</Text>
      <View style={styles.scoreGrid}>
        {TARGET_SCORES.map((score, i) => (
          <TouchableOpacity
            key={score}
            style={[
              styles.scoreButton,
              i === 4 ? styles.scoreButtonFull : styles.scoreButtonFlex,
              selectedScore === score ? styles.scoreButtonSelected : styles.scoreButtonDefault,
            ]}
            onPress={() => setSelectedScore(score)}
            accessibilityRole="button"
            accessibilityLabel={`Meta ${score} pontos`}
          >
            <Text style={[styles.scoreText, selectedScore === score ? styles.scoreTextSelected : styles.scoreTextDefault]}>
              {score}{i === 4 ? '+' : ''}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <Button label="Continuar" onPress={() => mutation.mutate()} disabled={!selectedScore} loading={mutation.isPending} />
      <Text style={styles.hint}>Você pode ajustar sua meta depois.</Text>
      <StepIndicator current={2} />
    </View>
  )
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.bg950,
    paddingHorizontal: spacing[6],
    paddingVertical: spacing[8] * 2,
    gap: spacing[8],
  },
  centeredScreen: {
    flex: 1,
    backgroundColor: colors.bg950,
    paddingHorizontal: spacing[6],
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing[8],
  },
  scroll: {
    flex: 1,
    backgroundColor: colors.bg950,
  },
  contentContainer: {
    paddingHorizontal: spacing[6],
    paddingVertical: spacing[8] * 2,
    gap: spacing[8],
  },
  heroBox: {
    width: '100%',
    height: 192,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroEmoji: {
    fontSize: 96,
  },
  heading: {
    color: colors.text100,
    fontSize: font['2xl'],
    fontWeight: 'bold',
  },
  headingCenter: {
    color: colors.text100,
    fontSize: font['2xl'],
    fontWeight: 'bold',
    textAlign: 'center',
  },
  subheading: {
    color: colors.text400,
    fontSize: font.base,
  },
  subheadingCenter: {
    color: colors.text400,
    fontSize: font.base,
    textAlign: 'center',
  },
  bottomGroup: {
    width: '100%',
    gap: spacing[4],
  },
  stepIndicator: {
    flexDirection: 'row',
    gap: spacing[2],
    justifyContent: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: radius.full,
  },
  dotActive: {
    backgroundColor: colors.indigo500,
  },
  dotInactive: {
    backgroundColor: '#3f3f46',
  },
  attributeList: {
    gap: spacing[3],
  },
  attributeCard: {
    backgroundColor: colors.bg900,
    borderWidth: 1,
    borderColor: colors.bg800,
    borderRadius: radius.lg,
    padding: spacing[4],
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
  },
  attributeEmoji: {
    fontSize: font.xl,
  },
  attributeInfo: {
    flex: 1,
  },
  attributeLabel: {
    fontWeight: '600',
  },
  attributeBar: {
    height: 6,
    backgroundColor: colors.bg800,
    borderRadius: radius.full,
    marginTop: spacing[2],
  },
  attributeLocked: {
    color: colors.text600,
    fontSize: font.xs,
  },
  scoreGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[3],
  },
  scoreButton: {
    backgroundColor: colors.bg900,
    borderWidth: 2,
    borderRadius: radius.lg,
    padding: spacing[4],
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreButtonFlex: {
    flex: 1,
  },
  scoreButtonFull: {
    width: '100%',
  },
  scoreButtonSelected: {
    borderColor: colors.indigo500,
    backgroundColor: colors.indigo500_10,
  },
  scoreButtonDefault: {
    borderColor: colors.bg800,
  },
  scoreText: {
    fontSize: font.lg,
    fontWeight: 'bold',
  },
  scoreTextSelected: {
    color: colors.indigo400,
  },
  scoreTextDefault: {
    color: colors.text100,
  },
  hint: {
    color: colors.text600,
    fontSize: font.xs,
    textAlign: 'center',
  },
})
