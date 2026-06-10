import { useQuery } from "@tanstack/react-query"
import type { DashboardData } from "@/models/user.model"

/** Fetches the authenticated user's dashboard data */
export function useDashboard() {
  return useQuery<DashboardData>({
    queryKey: ["dashboard"],
    queryFn: async () => {
      const res = await fetch("/api/v1/dashboard")
      if (!res.ok) throw new Error(`Dashboard request failed: ${res.status}`)
      return res.json() as Promise<DashboardData>
    },
  })
}
