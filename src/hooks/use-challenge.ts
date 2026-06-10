import { useQuery } from "@tanstack/react-query"
import type { Question } from "@/models/question.model"

/** Fetches the next challenge session questions */
export function useNextChallenge(enabled: boolean) {
  return useQuery<{ questions: Question[] }>({
    queryKey: ["challenge", "next"],
    queryFn: () => fetch("/api/v1/challenges/next").then((r) => r.json()),
    enabled,
  })
}
