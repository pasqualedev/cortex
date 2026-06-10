import { useQuery } from "@tanstack/react-query"
import type { SkillTreeData } from "@/models/skill-progress.model"

/** Fetches the authenticated user's skill tree data */
export function useSkillTree() {
  return useQuery<SkillTreeData>({
    queryKey: ["skill-tree"],
    queryFn: async () => {
      const res = await fetch("/api/v1/skill-tree")
      if (!res.ok) throw new Error(`Skill tree request failed: ${res.status}`)
      return res.json() as Promise<SkillTreeData>
    },
  })
}
