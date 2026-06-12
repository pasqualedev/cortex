import { z } from 'zod'

export const challengeQuerySchema = z.object({
  topicId: z.string().cuid().optional(),
  difficulty: z.coerce.number().int().min(1).max(5).optional(),
})

export const completeChallengeSchema = z.object({
  challengeId: z.string().cuid(),
})
