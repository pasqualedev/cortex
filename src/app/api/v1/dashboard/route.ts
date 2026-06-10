import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { getDashboardData } from "@/services/dashboard.service"

/** GET /api/v1/dashboard — returns brain status and skill summary */
export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const data = await getDashboardData(session.user.id)
  if (!data) return NextResponse.json({ error: "Not found" }, { status: 404 })

  return NextResponse.json(data)
}
