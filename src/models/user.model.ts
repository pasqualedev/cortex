export interface UserProfile {
  readonly id: string
  readonly email: string
  readonly name: string | null
  readonly image: string | null
  readonly targetScore: number | null
  readonly xp: number
  readonly level: number
  readonly streakDays: number
  readonly lastStudiedAt: Date | null
}

export interface DashboardData {
  readonly user: UserProfile
  readonly energiaNeuralPct: number
  readonly memoriaLongoPrazoPct: number
  readonly skillSummary: readonly AreaSummary[]
}

export interface AreaSummary {
  readonly area: string
  readonly accuracy: number
  readonly total: number
}
