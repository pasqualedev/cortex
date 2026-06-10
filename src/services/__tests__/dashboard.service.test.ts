import { describe, it, expect } from "vitest"
import { calcEnergiaNeuralPct, calcMemoriaLongoPrazoPct } from "../dashboard.service"

describe("calcEnergiaNeuralPct", () => {
  it("returns 0 for inactive user", () => {
    expect(calcEnergiaNeuralPct({ streakDays: 0, recentAnswers: 0 })).toBe(0)
  })

  it("caps at 100", () => {
    expect(calcEnergiaNeuralPct({ streakDays: 30, recentAnswers: 100 })).toBe(100)
  })

  it("calculates correctly for active user", () => {
    // 3*5 + 10*2 = 35
    expect(calcEnergiaNeuralPct({ streakDays: 3, recentAnswers: 10 })).toBe(35)
  })
})

describe("calcMemoriaLongoPrazoPct", () => {
  it("returns 0 for empty skill progress", () => {
    expect(calcMemoriaLongoPrazoPct([])).toBe(0)
  })

  it("calculates weighted average accuracy", () => {
    const progress = [
      { accuracy: 0.8, total: 10 },
      { accuracy: 0.6, total: 10 },
    ]
    // (0.8*10 + 0.6*10) / 20 = 0.7 → 70
    expect(calcMemoriaLongoPrazoPct(progress)).toBe(70)
  })
})
