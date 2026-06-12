import { z } from 'zod'

export const updateUserSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  image: z.string().url().optional(),
})

export const onboardingSchema = z.object({
  targetScore: z.number().int().refine(
    (v) => [500, 600, 700, 800, 900].includes(v),
    { message: 'targetScore must be 500, 600, 700, 800, or 900' },
  ),
})
