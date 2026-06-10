"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

const TARGETS = [500, 600, 700, 800, 900] as const

/**
 * OnboardingPage - Allows the user to select their ENEM target score.
 * Persists the selection via PUT /api/v1/users/me/onboarding and redirects to /dashboard.
 */
export default function OnboardingPage() {
  const router = useRouter()
  const [selected, setSelected] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleConfirm() {
    if (selected === null) return
    setLoading(true)

    await fetch("/api/v1/users/me/onboarding", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ targetScore: selected }),
    })

    router.push("/dashboard")
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-10 px-4">
      <div className="space-y-2 text-center">
        <p className="text-4xl">🧠</p>
        <h1 className="text-2xl font-semibold">Qual é a sua meta no ENEM?</h1>
        <p className="text-sm text-zinc-500">
          Isso ajuda o Cortex a calibrar seus desafios.
        </p>
      </div>

      <div className="flex flex-wrap justify-center gap-3">
        {TARGETS.map((score) => (
          <button
            key={score}
            onClick={() => setSelected(score)}
            className={`rounded-lg border px-6 py-4 text-lg font-semibold transition-colors ${
              selected === score
                ? "border-indigo-500 bg-indigo-500/10 text-indigo-400"
                : "border-zinc-800 bg-zinc-900 text-zinc-100 hover:border-zinc-600"
            }`}
          >
            {score}+
          </button>
        ))}
      </div>

      <Button
        onClick={handleConfirm}
        disabled={selected === null || loading}
        className="w-48 bg-indigo-500 hover:bg-indigo-600"
      >
        {loading ? "Salvando..." : "Começar"}
      </Button>
    </div>
  )
}
