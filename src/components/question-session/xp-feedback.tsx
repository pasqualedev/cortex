interface XpFeedbackProps {
  readonly isCorrect: boolean
  readonly xpEarned: number
  readonly correctKey: string
}

/** Inline feedback shown immediately after answering a question */
export function XpFeedback({ isCorrect, xpEarned, correctKey }: XpFeedbackProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={`rounded-lg border p-3 text-sm flex items-center justify-between ${
        isCorrect
          ? "border-green-800 bg-green-950/30 text-green-400"
          : "border-zinc-800 bg-zinc-900 text-zinc-400"
      }`}
    >
      <span>
        {isCorrect ? "Correto!" : `Resposta Correta: ${correctKey}`}
      </span>
      <span className="font-semibold text-indigo-400">+{xpEarned} XP</span>
    </div>
  )
}
