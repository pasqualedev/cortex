import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { buildChallengeSession } from "@/services/challenge.service"

/** GET /api/v1/challenges/next — returns a set of questions for a new challenge */
export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const questions = await buildChallengeSession(session.user.id)
  return NextResponse.json({ questions })
}
