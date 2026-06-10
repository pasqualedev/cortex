import { create } from "zustand"
import type { Question } from "@/models/question.model"

interface SessionAnswer {
  readonly questionId: string
  readonly chosenKey: string
  readonly isCorrect: boolean
  readonly xpEarned: number
}

interface ChallengeStore {
  readonly questions: readonly Question[]
  readonly currentIndex: number
  readonly answers: readonly SessionAnswer[]
  readonly isComplete: boolean
  startSession: (questions: readonly Question[]) => void
  recordAnswer: (answer: SessionAnswer) => void
  endSession: () => void
}

export const useChallengeStore = create<ChallengeStore>((set) => ({
  questions: [],
  currentIndex: 0,
  answers: [],
  isComplete: false,

  startSession: (questions) =>
    set({ questions, currentIndex: 0, answers: [], isComplete: false }),

  recordAnswer: (answer) =>
    set((state) => ({
      answers: [...state.answers, answer],
      currentIndex: state.currentIndex + 1,
      isComplete: state.currentIndex + 1 >= state.questions.length,
    })),

  endSession: () =>
    set({ questions: [], currentIndex: 0, answers: [], isComplete: false }),
}))
