import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { findUserById } from "@/repositories/user.repository"

/** GET /api/v1/users/me — get authenticated user profile */
export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const user = await findUserById(session.user.id)
  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 })

  return NextResponse.json(user)
}
