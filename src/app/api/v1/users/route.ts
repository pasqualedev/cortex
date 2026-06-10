import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { registerUser } from "@/services/user.service"

const registerSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2),
  password: z.string().min(6),
})

/** POST /api/v1/users — register a new user */
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null)
  const parsed = registerSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  try {
    const user = await registerUser(parsed.data)
    return NextResponse.json({ id: user.id }, { status: 201 })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error"
    return NextResponse.json({ error: message }, { status: 409 })
  }
}
