import { describe, it, expect, vi } from "vitest"
import type { SkillProgressEntry } from "@/models/skill-progress.model"

vi.mock("@/repositories/question.repository", () => ({
  findQuestionsForChallenge: vi.fn(),
  findRecentlyAnsweredQuestionIds: vi.fn(),
}))

vi.mock("@/repositories/skill-progress.repository", () => ({
  findAllSkillProgress: vi.fn(),
}))

import { getWeakTopics } from "../challenge.service"

describe("getWeakTopics", () => {
  it("returns topics with accuracy below 0.6", () => {
    const progress: SkillProgressEntry[] = [
      { area: "Matemática", topic: "Funções", accuracy: 0.4, total: 10, correct: 4 },
      { area: "Matemática", topic: "Geometria", accuracy: 0.8, total: 10, correct: 8 },
      { area: "Humanas", topic: "História", accuracy: 0.5, total: 10, correct: 5 },
    ]
    expect(getWeakTopics(progress)).toEqual(["Funções", "História"])
  })

  it("returns empty array when no progress exists", () => {
    expect(getWeakTopics([])).toEqual([])
  })

  it("returns empty when all topics are strong", () => {
    const progress: SkillProgressEntry[] = [
      { area: "Matemática", topic: "Funções", accuracy: 0.8, total: 10, correct: 8 },
    ]
    expect(getWeakTopics(progress)).toEqual([])
  })

  it("includes topic exactly at threshold 0.6 as NOT weak", () => {
    const progress: SkillProgressEntry[] = [
      { area: "Matemática", topic: "Álgebra", accuracy: 0.6, total: 10, correct: 6 },
    ]
    expect(getWeakTopics(progress)).toEqual([])
  })
})
