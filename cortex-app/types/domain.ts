export type CognitiveAttribute =
  | 'ENERGIA_NEURAL'
  | 'MEMORIA'
  | 'LOGICA'
  | 'INTERPRETACAO'
  | 'CIENCIAS'

export interface User {
  readonly id: string
  readonly email: string
  readonly name: string
  readonly image: string | null
  readonly xp: number
  readonly level: number
  readonly streakDays: number
  readonly hasCompletedOnboarding: boolean
}

export interface TokenPair {
  readonly accessToken: string
  readonly refreshToken: string
}

export interface AuthResponse {
  readonly user: User
  readonly tokens: TokenPair
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

export interface ChallengeSession {
  readonly challengeId: string
  readonly questions: readonly QuestionDTO[]
}

export interface CognitiveImpactItem {
  readonly attribute: CognitiveAttribute
  readonly delta: number
}

export interface AttemptResult {
  readonly isCorrect: boolean
  readonly correctKey: string
  readonly xpEarned: number
  readonly cognitiveImpact: readonly CognitiveImpactItem[]
  readonly explanation: string | null
}

export interface BrainMetrics {
  readonly energiaNeuralScore: number
  readonly memoriaScore: number
  readonly logicaScore: number
  readonly interpretacaoScore: number
  readonly cienciasScore: number
  readonly estimatedScore: number
}

export interface DashboardData {
  readonly user: {
    readonly name: string
    readonly level: number
    readonly xp: number
    readonly streakDays: number
  }
  readonly brainMetrics: BrainMetrics
  readonly recentActivity: {
    readonly questionsThisWeek: number
    readonly correctThisWeek: number
    readonly sessionsThisWeek: number
  }
}

export interface Achievement {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly icon: string
}

export interface UnlockedAchievement extends Achievement {
  readonly unlockedAt: string
}

export interface LockedAchievement extends Achievement {
  readonly progress: number
  readonly threshold: number
}

export interface AchievementsResponse {
  readonly unlocked: readonly UnlockedAchievement[]
  readonly locked: readonly LockedAchievement[]
}

export interface BrainHistoryResponse {
  readonly snapshots: readonly BrainMetrics[]
}
