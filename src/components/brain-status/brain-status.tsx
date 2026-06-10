import { Progress } from "@/components/ui/progress"

interface BrainStatusProps {
  readonly energiaNeuralPct: number
  readonly memoriaLongoPrazoPct: number
  readonly level: number
  readonly streakDays: number
  readonly xp: number
}

/** Central dashboard widget showing cognitive brain attributes */
export function BrainStatus({
  energiaNeuralPct,
  memoriaLongoPrazoPct,
  level,
  streakDays,
  xp,
}: BrainStatusProps) {
  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-6 space-y-5">
      <div className="flex items-center gap-2">
        <span className="text-2xl" aria-hidden="true">🧠</span>
        <h2 className="text-lg font-semibold">Seu Cérebro</h2>
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-zinc-500">Nível Geral</p>
          <p className="text-xl font-bold text-indigo-400">{level}</p>
        </div>
        <div>
          <p className="text-zinc-500">Streak</p>
          <p className="text-xl font-bold">🔥 {streakDays} dias</p>
        </div>
        <div>
          <p className="text-zinc-500">XP Total</p>
          <p className="font-semibold">{xp.toLocaleString("pt-BR")} XP</p>
        </div>
      </div>

      <div className="space-y-3">
        <div className="space-y-1">
          <div className="flex justify-between text-sm">
            <span className="text-zinc-400">Energia Neural</span>
            <span className="text-indigo-400">{energiaNeuralPct}%</span>
          </div>
          <Progress value={energiaNeuralPct} className="h-2 bg-zinc-800" />
        </div>

        <div className="space-y-1">
          <div className="flex justify-between text-sm">
            <span className="text-zinc-400">Memória de Longo Prazo</span>
            <span className="text-indigo-400">{memoriaLongoPrazoPct}%</span>
          </div>
          <Progress value={memoriaLongoPrazoPct} className="h-2 bg-zinc-800" />
        </div>
      </div>
    </div>
  )
}
