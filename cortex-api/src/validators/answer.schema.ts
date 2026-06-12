import { z } from 'zod'

export const submitAnswerSchema = z.object({
  challengeId: z.string().cuid(),
  questionId: z.string().cuid(),
  chosenKey: z.enum(['A', 'B', 'C', 'D', 'E']),
  consecutiveCorrect: z.number().int().min(0),
})
