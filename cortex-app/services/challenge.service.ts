import { api } from '../lib/api'
import type { ChallengeSession, AttemptResult } from '../types/domain'

interface SubmitAnswerInput {
  readonly challengeId: string
  readonly questionId: string
  readonly chosenKey: string
  readonly consecutiveCorrect: number
}

export const getNextChallenge = async (params: { topicId?: string; difficulty?: number } = {}): Promise<ChallengeSession> => {
  const { data } = await api.get<ChallengeSession>('/v1/challenges/next', { params })
  return data
}

export const submitAnswer = async (input: SubmitAnswerInput): Promise<AttemptResult> => {
  const { data } = await api.post<AttemptResult>('/v1/answers', input)
  return data
}

export const completeChallenge = async (challengeId: string): Promise<void> => {
  await api.patch(`/v1/challenges/${challengeId}/complete`)
}
