export interface Alternative {
  readonly key: string
  readonly text: string
}

export interface Question {
  readonly id: string
  readonly externalId: string
  readonly year: number
  readonly index: number
  readonly area: string
  readonly topic: string
  readonly subtopic: string
  readonly statement: string
  readonly alternatives: readonly Alternative[]
  readonly correctKey: string
  readonly difficulty: number
  readonly imageUrl: string | null
}
