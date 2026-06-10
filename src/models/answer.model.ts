export interface SubmitAnswerInput {
  readonly questionId: string
  readonly chosenKey: string
}

export interface AnswerResult {
  readonly isCorrect: boolean
  readonly xpEarned: number
  readonly correctKey: string
  readonly newXp: number
  readonly newLevel: number
  readonly newStreakDays: number
}
