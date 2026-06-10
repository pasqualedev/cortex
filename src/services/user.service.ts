import bcrypt from "bcryptjs"
import { createUserWithPassword, updateUserOnboarding, findUserByEmail } from "@/repositories/user.repository"
import type { UserProfile } from "@/models/user.model"

const VALID_TARGET_SCORES = [500, 600, 700, 800, 900] as const

/**
 * Registers a new user with email and hashed password.
 * @param data - Object containing email, name, and plaintext password.
 * @returns The created user's profile.
 */
export async function registerUser(data: {
  email: string
  name: string
  password: string
}): Promise<UserProfile> {
  const existing = await findUserByEmail(data.email)
  if (existing) throw new Error("Email already in use")

  const passwordHash = await bcrypt.hash(data.password, 12)
  return createUserWithPassword({ email: data.email, name: data.name, passwordHash })
}

/**
 * Persists the user's ENEM target score from onboarding.
 * @param userId - The user's unique identifier.
 * @param targetScore - The desired ENEM target score (must be one of 500, 600, 700, 800, 900).
 */
export async function saveOnboardingTarget(userId: string, targetScore: number): Promise<void> {
  if (!(VALID_TARGET_SCORES as readonly number[]).includes(targetScore)) {
    throw new Error("Invalid target score")
  }
  await updateUserOnboarding(userId, targetScore)
}
