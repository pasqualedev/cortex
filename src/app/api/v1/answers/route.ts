import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { auth } from "@/lib/auth"
import { submitAnswer } from "@/services/answer.service"

const answerSchema = z.object({
  questionId: z.string().min(1),
  chosenKey: z.string().length(1),
  consecutiveCorrect: z.number().int().min(0),
})

/** POST /api/v1/answers — submit an answer and get XP/streak result */
export async function POST(request: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json().catch(() => null)
  const parsed = answerSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  try {
    const { questionId, chosenKey, consecutiveCorrect } = parsed.data
    const result = await submitAnswer(
      session.user.id,
      { questionId, chosenKey },
      consecutiveCorrect
    )
    return NextResponse.json(result)
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
