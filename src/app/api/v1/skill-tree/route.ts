import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { getSkillTreeData } from "@/services/skill-tree.service"

/** GET /api/v1/skill-tree — returns skill progress aggregated by area and topic */
export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const data = await getSkillTreeData(session.user.id)
  return NextResponse.json(data)
}
