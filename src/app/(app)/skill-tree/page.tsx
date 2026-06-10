"use client"

import { useRouter } from "next/navigation"
import { useSkillTree } from "@/hooks/use-skill-tree"
import { Progress } from "@/components/ui/progress"

export default function SkillTreePage() {
  const router = useRouter()
  const { data, isPending } = useSkillTree()

  if (isPending) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-zinc-500">Carregando...</p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-8 space-y-6">
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.push("/dashboard")}
          className="text-zinc-500 hover:text-zinc-300 text-sm"
        >
          ← Voltar
        </button>
        <h1 className="text-lg font-semibold">Skill Tree</h1>
      </div>

      {!data || data.areas.length === 0 ? (
        <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-8 text-center">
          <p className="text-zinc-500 text-sm">
            Complete seu primeiro desafio para ver sua evolução aqui.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {data.areas.map((area) => (
            <div
              key={area.area}
              className="rounded-lg border border-zinc-800 bg-zinc-900 p-4 space-y-4"
            >
              <div className="flex items-center justify-between">
                <h2 className="font-semibold">{area.area}</h2>
                <span className="text-sm text-indigo-400">
                  {Math.round(area.accuracy * 100)}%
                </span>
              </div>
              <Progress
                value={Math.round(area.accuracy * 100)}
                className="h-1.5 bg-zinc-800"
              />

              <div className="space-y-2 pt-1">
                {area.topics.map((topic) => (
                  <div key={topic.topic} className="space-y-1">
                    <div className="flex justify-between text-xs text-zinc-400">
                      <span>{topic.topic}</span>
                      <span>
                        {topic.total} questões · {Math.round(topic.accuracy * 100)}%
                      </span>
                    </div>
                    <Progress
                      value={Math.round(topic.accuracy * 100)}
                      className="h-1 bg-zinc-800"
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
