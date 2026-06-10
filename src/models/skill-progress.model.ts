export interface SkillProgressEntry {
  readonly area: string
  readonly topic: string
  readonly accuracy: number
  readonly total: number
  readonly correct: number
}

export interface SkillTreeData {
  readonly areas: readonly AreaProgress[]
}

export interface AreaProgress {
  readonly area: string
  readonly accuracy: number
  readonly total: number
  readonly topics: readonly SkillProgressEntry[]
}
