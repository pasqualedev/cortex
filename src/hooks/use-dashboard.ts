import { useQuery } from "@tanstack/react-query"
import type { DashboardData } from "@/models/user.model"

/** Fetches the authenticated user's dashboard data */
export function useDashboard() {
  return useQuery<DashboardData>({
    queryKey: ["dashboard"],
    queryFn: () => fetch("/api/v1/dashboard").then((r) => r.json()),
  })
}
