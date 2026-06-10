import "@testing-library/jest-dom"
import { vi } from "vitest"

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: { findUnique: vi.fn(), create: vi.fn(), update: vi.fn() },
    answer: { create: vi.fn(), count: vi.fn() },
    skillProgress: { findMany: vi.fn(), findUnique: vi.fn(), upsert: vi.fn() },
  },
}))
