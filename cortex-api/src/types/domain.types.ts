import { CognitiveAttribute } from '@prisma/client'

export interface UserDTO {
  readonly id: string
  readonly email: string
  readonly name: string
  readonly image: string | null
  readonly xp: number
  readonly level: number
  readonly streakDays: number
  readonly hasCompletedOnboarding: boolean
}

export interface CognitiveImpactItem {
  readonly attribute: CognitiveAttribute
  readonly delta: number
}

export interface BrainMetricsDTO {
  readonly energiaNeuralScore: number
  readonly memoriaScore: number
  readonly logicaScore: number
  readonly interpretacaoScore: number
  readonly cienciasScore: number
  readonly estimatedScore: number
}

export interface AlternativeDTO {
  readonly key: string
  readonly text: string
}

export interface QuestionDTO {
  readonly id: string
  readonly statement: string
  readonly alternatives: readonly AlternativeDTO[]
  readonly imageUrl: string | null
  readonly year: number
  readonly topic: {
    readonly name: string
    readonly cognitiveAttribute: CognitiveAttribute
  }
}

export interface TokenPair {
  readonly accessToken: string
  readonly refreshToken: string
}

export interface AttemptResult {
  readonly isCorrect: boolean
  readonly correctKey: string
  readonly xpEarned: number
  readonly cognitiveImpact: readonly CognitiveImpactItem[]
  readonly explanation: string | null
}
