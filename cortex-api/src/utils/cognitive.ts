import { CognitiveAttribute } from '@prisma/client'
import { CognitiveImpactItem } from '../types/domain.types'

const DECAY_LAMBDA = 0.05
const COLD_START_THRESHOLD = 20
const ENERGY_DAILY_GOAL = 10
const ENERGY_WEEK_GOAL = ENERGY_DAILY_GOAL * 7 // 70

interface AttemptWeight {
  readonly isCorrect: boolean
  readonly daysAgo: number
}

interface AreaAccuracies {
  readonly logica: number | null
  readonly ciencias: number | null
  readonly interpretacao: number | null
  readonly memoria: number | null
}

/** Calculates Energia Neural based on questions answered in last 7 days. */
export function calculateEnergiaNeuralScore(questionsLast7Days: number): number {
  return Math.min(100, (questionsLast7Days / ENERGY_WEEK_GOAL) * 100)
}

/**
 * Calculates accuracy score with exponential time decay.
 * Applies cold-start dampening for < 20 attempts.
 */
export function calculateAccuracyScore(attempts: readonly AttemptWeight[]): number {
  if (attempts.length === 0) return 0

  let weightedCorrect = 0
  let weightedTotal = 0

  for (const attempt of attempts) {
    const weight = Math.exp(-DECAY_LAMBDA * attempt.daysAgo)
    weightedCorrect += weight * (attempt.isCorrect ? 1 : 0)
    weightedTotal += weight
  }

  const rawScore = weightedTotal > 0 ? (weightedCorrect / weightedTotal) * 100 : 0
  const n = attempts.length

  if (n < COLD_START_THRESHOLD) {
    return rawScore * (n / COLD_START_THRESHOLD)
  }

  return rawScore
}

/**
 * Calculates estimated ENEM score (300–1000) from area accuracies.
 * Returns 0 if no areas have data.
 */
export function calculateEstimatedScore(areas: AreaAccuracies): number {
  const weights = [areas.logica, areas.ciencias, areas.interpretacao, areas.memoria]
  const available = weights.filter((w): w is number => w !== null)

  if (available.length === 0) return 0

  const avgAccuracy = available.reduce((sum, w) => sum + w, 0) / available.length
  return Math.round(300 + avgAccuracy * 700)
}

/** Returns the topic's cognitive attribute (passthrough — stored for future expansion). */
export function getCognitiveAttributeForTopic(topicAttribute: CognitiveAttribute): CognitiveAttribute {
  return topicAttribute
}

/** Filters cognitive impact items to only include those with |delta| >= 0.5. */
export function filterSignificantImpacts(impacts: readonly CognitiveImpactItem[]): readonly CognitiveImpactItem[] {
  return impacts.filter((impact) => Math.abs(impact.delta) >= 0.5)
}
