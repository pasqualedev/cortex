import { describe, it, expect, vi } from "vitest"

vi.mock("@/repositories/user.repository", () => ({ findUserById: vi.fn(), updateUserProgress: vi.fn() }))
vi.mock("@/repositories/question.repository", () => ({ findQuestionById: vi.fn() }))
vi.mock("@/repositories/answer.repository", () => ({ createAnswer: vi.fn() }))
vi.mock("@/repositories/skill-progress.repository", () => ({ upsertSkillProgress: vi.fn() }))

import { calcXpEarned, calcNewLevel, calcNewStreak, LEVEL_THRESHOLDS } from "../answer.service"

describe("calcXpEarned", () => {
  it("gives 10 XP for correct answer with no streak bonus", () => {
    expect(calcXpEarned({ isCorrect: true, consecutiveCorrect: 0 })).toBe(10)
  })

  it("gives 3 XP for wrong answer", () => {
    expect(calcXpEarned({ isCorrect: false, consecutiveCorrect: 0 })).toBe(3)
  })

  it("adds 5 XP bonus after 3 consecutive correct answers", () => {
    expect(calcXpEarned({ isCorrect: true, consecutiveCorrect: 3 })).toBe(15)
  })

  it("adds bonus for 5 consecutive correct answers", () => {
    expect(calcXpEarned({ isCorrect: true, consecutiveCorrect: 5 })).toBe(15)
  })
})

describe("calcNewLevel", () => {
  it("stays at level 1 with 0 XP", () => {
    expect(calcNewLevel(0)).toBe(1)
  })

  it("advances to level 2 at 100 XP", () => {
    expect(calcNewLevel(100)).toBe(2)
  })

  it("advances to level 3 at 250 XP", () => {
    expect(calcNewLevel(250)).toBe(3)
  })

  it("stays at level 2 with 249 XP", () => {
    expect(calcNewLevel(249)).toBe(2)
  })
})

describe("calcNewStreak", () => {
  it("increments streak when last studied was yesterday", () => {
    const yesterday = new Date(Date.now() - 25 * 60 * 60 * 1000) // 25h ago
    expect(calcNewStreak({ currentStreak: 5, lastStudiedAt: yesterday })).toBe(6)
  })

  it("keeps streak when last studied was today", () => {
    const today = new Date(Date.now() - 1 * 60 * 60 * 1000) // 1h ago
    expect(calcNewStreak({ currentStreak: 5, lastStudiedAt: today })).toBe(5)
  })

  it("resets streak to 1 when last studied was 2+ days ago", () => {
    const twoDaysAgo = new Date(Date.now() - 49 * 60 * 60 * 1000) // 49h ago
    expect(calcNewStreak({ currentStreak: 5, lastStudiedAt: twoDaysAgo })).toBe(1)
  })

  it("starts streak at 1 when no previous study", () => {
    expect(calcNewStreak({ currentStreak: 0, lastStudiedAt: null })).toBe(1)
  })
})

describe("LEVEL_THRESHOLDS", () => {
  it("level 1 starts at 0", () => {
    expect(LEVEL_THRESHOLDS[0]).toBe(0)
  })

  it("level 2 starts at 100", () => {
    expect(LEVEL_THRESHOLDS[1]).toBe(100)
  })

  it("level 3 starts at 250", () => {
    expect(LEVEL_THRESHOLDS[2]).toBe(250)
  })
})
