import { Progress } from "@/components/ui/progress"
import type { AreaSummary } from "@/models/user.model"

interface SkillCardProps {
  readonly area: AreaSummary
}

/** Compact area progress card shown in the dashboard skill overview */
export function SkillCard({ area }: SkillCardProps) {
  const accuracyPct = Math.round(area.accuracy * 100)

  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-4 space-y-2">
      <div className="flex justify-between text-sm">
        <span className="font-medium">{area.area}</span>
        <span className="text-zinc-500">{area.total} questões</span>
      </div>
      <div className="space-y-1">
        <Progress value={accuracyPct} className="h-1.5 bg-zinc-800" />
        <p className="text-right text-xs text-indigo-400">{accuracyPct}%</p>
      </div>
    </div>
  )
}
