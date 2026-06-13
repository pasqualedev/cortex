import { View, StyleSheet } from 'react-native'
import { useRouter } from 'expo-router'
import { useState } from 'react'
import { useResultStore } from '../../../stores/result.store'
import { StepCelebration } from '../../../components/resultado/StepCelebration'
import { StepScoreXP } from '../../../components/resultado/StepScoreXP'
import { StepStreak } from '../../../components/resultado/StepStreak'
import { colors } from '../../../lib/theme'

type Step = 1 | 2 | 3

/**
 * ResultadoScreen — 3-step animated post-challenge celebration.
 * Step 1: confetti + celebration. Step 2: score/XP bars. Step 3: streak.
 * Session data comes from resultStore, populated before navigation.
 */
export default function ResultadoScreen() {
  const router = useRouter()
  const [step, setStep] = useState<Step>(1)
  const { xpEarned, correctCount, totalCount, maxCombo, streakDays, reset } =
    useResultStore()

  const handleHome = () => {
    reset()
    router.replace('/(app)')
  }

  const handleNewChallenge = () => {
    reset()
    router.replace('/(app)/desafio')
  }

  return (
    <View style={styles.container}>
      {step === 1 ? (
        <StepCelebration
          totalCount={totalCount}
          onAdvance={() => setStep(2)}
        />
      ) : step === 2 ? (
        <StepScoreXP
          xpEarned={xpEarned}
          correctCount={correctCount}
          totalCount={totalCount}
          maxCombo={maxCombo}
          onAdvance={() => setStep(3)}
        />
      ) : (
        <StepStreak
          streakDays={streakDays}
          onHome={handleHome}
          onNewChallenge={handleNewChallenge}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg950,
  },
})
