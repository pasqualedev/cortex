import Image from "next/image"
import type { Question } from "@/models/question.model"

type AlternativeVariant = "default" | "correct" | "wrong" | "neutral"

interface QuestionCardProps {
  readonly question: Question
  readonly onAnswer: (key: string) => void
  readonly disabled: boolean
  readonly selectedKey: string | null
  readonly correctKey: string | null
}

const variantStyles: Record<AlternativeVariant, string> = {
  default: "border-zinc-800 bg-zinc-900 hover:border-zinc-600",
  correct: "border-green-600 bg-green-950/30",
  wrong: "border-red-600 bg-red-950/30",
  neutral: "border-zinc-800 bg-zinc-900 opacity-50",
}

/** Renders a single ENEM question with answer alternatives and result feedback */
export function QuestionCard({
  question,
  onAnswer,
  disabled,
  selectedKey,
  correctKey,
}: QuestionCardProps) {
  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
        {question.imageUrl && (
          <Image
            src={question.imageUrl}
            alt="Imagem da questão"
            width={700}
            height={400}
            className="mb-4 w-full rounded"
          />
        )}
        <p className="text-sm leading-relaxed text-zinc-100">{question.statement}</p>
      </div>

      <div className="space-y-2">
        {question.alternatives.map((alt) => {
          let variant: AlternativeVariant = "default"
          if (correctKey !== null) {
            if (alt.key === correctKey) variant = "correct"
            else if (alt.key === selectedKey) variant = "wrong"
            else variant = "neutral"
          }

          return (
            <button
              key={alt.key}
              disabled={disabled}
              onClick={() => onAnswer(alt.key)}
              className={`w-full rounded-lg border p-3 text-left text-sm transition-colors ${variantStyles[variant]}`}
              aria-label={`Alternativa ${alt.key}`}
            >
              <span className="font-semibold text-indigo-400 mr-2">{alt.key}.</span>
              {alt.text}
            </button>
          )
        })}
      </div>
    </div>
  )
}
