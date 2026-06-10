import { useQuery } from "@tanstack/react-query"
import type { SkillTreeData } from "@/models/skill-progress.model"

/** Fetches the authenticated user's skill tree data */
export function useSkillTree() {
  return useQuery<SkillTreeData>({
    queryKey: ["skill-tree"],
    queryFn: () => fetch("/api/v1/skill-tree").then((r) => r.json()),
  })
}
