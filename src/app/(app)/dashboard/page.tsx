"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useDashboard } from "@/hooks/use-dashboard"
import { BrainStatus } from "@/components/brain-status/brain-status"
import { SkillCard } from "@/components/skill-card/skill-card"
import { Button } from "@/components/ui/button"

/** @description Main dashboard showing brain status, challenge CTA, and skill area cards */
export default function DashboardPage() {
  const router = useRouter()
  const { data, isPending, isError } = useDashboard()

  useEffect(() => {
    if (data?.user.targetScore === null) {
      router.push("/onboarding")
    }
  }, [data, router])

  if (isPending) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-zinc-500">Carregando...</p>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-zinc-500">Erro ao carregar o dashboard. Tente novamente.</p>
      </div>
    )
  }

  if (!data) return null

  return (
    <div className="mx-auto max-w-lg px-4 py-8 space-y-6">
      <BrainStatus
        energiaNeuralPct={data.energiaNeuralPct}
        memoriaLongoPrazoPct={data.memoriaLongoPrazoPct}
        level={data.user.level}
        streakDays={data.user.streakDays}
        xp={data.user.xp}
      />

      <Button
        onClick={() => router.push("/desafio")}
        className="w-full bg-indigo-500 hover:bg-indigo-600 h-14 text-base font-semibold"
      >
        COMEÇAR DESAFIO
      </Button>

      {data.skillSummary.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-zinc-400">Evolução por Área</h3>
          <div className="grid grid-cols-2 gap-3">
            {data.skillSummary.map((area) => (
              <SkillCard key={area.area} area={area} />
            ))}
          </div>
        </div>
      )}

      <Button
        variant="ghost"
        onClick={() => router.push("/skill-tree")}
        className="text-sm text-zinc-500 hover:text-zinc-300 w-full justify-start px-0"
      >
        Ver Skill Tree completa →
      </Button>
    </div>
  )
}
