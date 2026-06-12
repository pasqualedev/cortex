import { useState } from 'react'
import { View, ScrollView, SafeAreaView, TouchableOpacity, Text } from 'react-native'
import { useRouter } from 'expo-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getNextChallenge, submitAnswer, completeChallenge } from '../../../services/challenge.service'
import { SessionProgress, QuestionCard, FeedbackOverlay } from '../../../components/challenge'
import { SkeletonLoader } from '../../../components/ui/SkeletonLoader'
import { Modal } from '../../../components/ui/Modal'
import { QueryKeys } from '../../../lib/query-keys'
import type { AttemptResult } from '../../../types/domain'

/**
 * ChallengeScreen — active challenge session screen.
 * Fetches the next challenge, steps through questions one at a time,
 * submits each answer, shows feedback, and on completion navigates
 * to the resultado screen while invalidating relevant query caches.
 */
export default function ChallengeScreen() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedKey, setSelectedKey] = useState<string | null>(null)
  const [result, setResult] = useState<AttemptResult | null>(null)
  const [showExitModal, setShowExitModal] = useState(false)

  const { data: session, isLoading } = useQuery({
    queryKey: QueryKeys.challengeNext,
    queryFn: getNextChallenge,
    staleTime: Infinity, // don't refetch mid-session
  })

  const submitMutation = useMutation({
    mutationFn: ({ questionId, key }: { questionId: string; key: string }) =>
      submitAnswer(session!.challengeId, questionId, key),
    onSuccess: (attemptResult) => setResult(attemptResult),
  })

  const completeMutation = useMutation({
    mutationFn: () => completeChallenge(session!.challengeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QueryKeys.dashboard })
      queryClient.invalidateQueries({ queryKey: QueryKeys.brainCurrent })
      router.replace('/(app)/desafio/resultado')
    },
  })

  /**
   * Handles alternative selection for the current question.
   * Prevents re-selection once an answer has been submitted.
   * @param key - The selected alternative key
   */
  const handleSelect = (key: string) => {
    if (result) return
    setSelectedKey(key)
    submitMutation.mutate({ questionId: session!.questions[currentIndex].id, key })
  }

  /**
   * Advances to the next question or completes the session if on the last question.
   */
  const handleNext = () => {
    if (!session) return
    const isLast = currentIndex === session.questions.length - 1
    if (isLast) {
      completeMutation.mutate()
    } else {
      setCurrentIndex((i) => i + 1)
      setSelectedKey(null)
      setResult(null)
    }
  }

  if (isLoading || !session) {
    return (
      <View className="flex-1 bg-zinc-950 px-4 py-6 gap-4">
        <SkeletonLoader width="100%" height={20} />
        <SkeletonLoader width="100%" height={160} rounded />
        <SkeletonLoader width="100%" height={56} rounded />
        <SkeletonLoader width="100%" height={56} rounded />
        <SkeletonLoader width="100%" height={56} rounded />
      </View>
    )
  }

  const question = session.questions[currentIndex]

  return (
    <SafeAreaView className="flex-1 bg-zinc-950">
      <View className="px-4 pt-4 gap-3">
        <TouchableOpacity
          onPress={() => setShowExitModal(true)}
          className="self-start"
          accessibilityRole="button"
          accessibilityLabel="Sair do desafio"
        >
          <Text className="text-zinc-500 text-sm">✕ Sair</Text>
        </TouchableOpacity>
        <SessionProgress current={currentIndex + 1} total={session.questions.length} />
      </View>
      <ScrollView className="flex-1 px-4 py-4" contentContainerClassName="gap-4">
        <QuestionCard
          question={question}
          selectedKey={selectedKey}
          correctKey={result?.correctKey ?? null}
          onSelect={handleSelect}
        />
      </ScrollView>
      {result ? (
        <FeedbackOverlay
          result={result}
          isLast={currentIndex === session.questions.length - 1}
          onNext={handleNext}
        />
      ) : null}
      <Modal
        visible={showExitModal}
        title="Sair do desafio?"
        message="Seu progresso nesta sessão será perdido."
        confirmLabel="Sair"
        cancelLabel="Continuar"
        onConfirm={() => router.back()}
        onCancel={() => setShowExitModal(false)}
      />
    </SafeAreaView>
  )
}
