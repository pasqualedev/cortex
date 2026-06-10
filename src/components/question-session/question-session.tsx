"use client"

import { useMemo, useState } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { z } from "zod"
import { useChallengeStore } from "@/store/challenge.store"
import { QuestionCard } from "./question-card"
import { XpFeedback } from "./xp-feedback"
import { Button } from "@/components/ui/button"
import type { AnswerResult } from "@/models/answer.model"

const answerResultSchema = z.object({
  isCorrect: z.boolean(),
  xpEarned: z.number(),
  correctKey: z.string(),
  newXp: z.number(),
  newLevel: z.number(),
  newStreakDays: z.number(),
})

interface QuestionSessionProps {
  readonly onComplete: () => void
}

/** Orchestrates the full question session: display, answer, feedback, next */
export function QuestionSession({ onComplete }: QuestionSessionProps) {
  const queryClient = useQueryClient()
  const { questions, currentIndex, answers, isComplete, recordAnswer, endSession } =
    useChallengeStore()

  const [selectedKey, setSelectedKey] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<AnswerResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [fetchError, setFetchError] = useState<string | null>(null)

  const currentQuestion = questions[currentIndex]

  const consecutiveCorrect = useMemo(() => {
    let count = 0
    for (let i = answers.length - 1; i >= 0; i--) {
      if (answers[i]?.isCorrect) count++
      else break
    }
    return count
  }, [answers])

  async function handleAnswer(key: string) {
    if (feedback !== null || loading || currentQuestion === undefined) return
    setSelectedKey(key)
    setLoading(true)
    setFetchError(null)

    try {
      const res = await fetch("/api/v1/answers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionId: currentQuestion.id,
          chosenKey: key,
          consecutiveCorrect,
        }),
      })

      if (!res.ok) throw new Error(`Answer request failed: ${res.status}`)

      const parsed = answerResultSchema.safeParse(await res.json())
      if (!parsed.success) throw new Error("Invalid response from server")

      const result = parsed.data
      setFeedback(result)
      recordAnswer({
        questionId: currentQuestion.id,
        chosenKey: key,
        isCorrect: result.isCorrect,
        xpEarned: result.xpEarned,
      })
    } catch {
      setFetchError("Erro ao enviar resposta. Tente novamente.")
      setSelectedKey(null)
    } finally {
      setLoading(false)
    }
  }

  function handleNext() {
    setSelectedKey(null)
    setFeedback(null)

    if (isComplete) {
      void queryClient.invalidateQueries({ queryKey: ["dashboard"] })
      endSession()
      onComplete()
    }
  }

  if (currentQuestion === undefined) return null

  return (
    <div className="space-y-4">
      <div className="flex justify-between text-sm text-zinc-500">
        <span>{currentIndex + 1} / {questions.length}</span>
        <span>{answers.filter((a) => a.isCorrect).length} acertos</span>
      </div>

      <QuestionCard
        question={currentQuestion}
        onAnswer={handleAnswer}
        disabled={feedback !== null || loading}
        selectedKey={selectedKey}
        correctKey={feedback?.correctKey ?? null}
      />

      {fetchError && (
        <p role="alert" className="text-sm text-red-400">{fetchError}</p>
      )}

      {feedback !== null && (
        <>
          <XpFeedback
            isCorrect={feedback.isCorrect}
            xpEarned={feedback.xpEarned}
            correctKey={feedback.correctKey}
          />
          <Button
            onClick={handleNext}
            className="w-full bg-indigo-500 hover:bg-indigo-600"
          >
            {isComplete ? "Ver Resultado" : "Próxima"}
          </Button>
        </>
      )}
    </div>
  )
}
