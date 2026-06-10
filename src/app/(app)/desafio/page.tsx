"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useNextChallenge } from "@/hooks/use-challenge"
import { useChallengeStore } from "@/store/challenge.store"
import { QuestionSession } from "@/components/question-session/question-session"
import { Button } from "@/components/ui/button"

export default function DesafioPage() {
  const router = useRouter()
  const { questions, startSession } = useChallengeStore()
  const { data, isPending, isError } = useNextChallenge(questions.length === 0)

  useEffect(() => {
    if (data !== undefined && questions.length === 0) {
      startSession(data.questions)
    }
  }, [data, questions.length, startSession])

  if (isPending && questions.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-zinc-500">Preparando desafio...</p>
      </div>
    )
  }

  if (isError || (data?.questions.length === 0 && questions.length === 0)) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4">
        <p className="text-zinc-400">Nenhuma questão disponível no momento.</p>
        <Button onClick={() => router.push("/dashboard")} variant="outline">
          Voltar
        </Button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-8 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">Desafio</h1>
        <button
          onClick={() => router.push("/dashboard")}
          className="text-sm text-zinc-500 hover:text-zinc-300"
        >
          Sair
        </button>
      </div>

      <QuestionSession onComplete={() => router.push("/dashboard")} />
    </div>
  )
}
