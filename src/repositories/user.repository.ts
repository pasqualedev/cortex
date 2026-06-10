import { prisma } from "@/lib/prisma"
import { UserProfile } from "@/models/user.model"

export type { UserProfile }

const userSelect = {
  id: true,
  email: true,
  name: true,
  image: true,
  targetScore: true,
  xp: true,
  level: true,
  streakDays: true,
  lastStudiedAt: true,
} as const

/**
 * Finds a user by their unique ID.
 * @param id - The user's unique identifier.
 * @returns The user profile or null if not found.
 */
export async function findUserById(id: string): Promise<UserProfile | null> {
  return prisma.user.findUnique({ where: { id }, select: userSelect })
}

/**
 * Finds a user by their email address.
 * @param email - The user's email address.
 * @returns The user profile or null if not found.
 */
export async function findUserByEmail(email: string): Promise<UserProfile | null> {
  return prisma.user.findUnique({ where: { email }, select: userSelect })
}

/**
 * Creates a new user with credentials-based authentication.
 * @param data - The user's email, display name, and hashed password.
 * @returns The created user's profile.
 */
export async function createUserWithPassword(data: {
  readonly email: string
  readonly name: string
  readonly passwordHash: string
}): Promise<UserProfile> {
  return prisma.user.create({ data, select: userSelect })
}

/**
 * Updates the target ENEM score for a user during onboarding.
 * @param userId - The user's unique identifier.
 * @param targetScore - The desired ENEM score target.
 */
export async function updateUserOnboarding(
  userId: string,
  targetScore: number
): Promise<void> {
  await prisma.user.update({ where: { id: userId }, data: { targetScore } })
}

/**
 * Updates XP, level, streak, and last study timestamp for a user.
 * @param userId - The user's unique identifier.
 * @param data - The progress fields to update.
 */
export async function updateUserProgress(
  userId: string,
  data: {
    readonly xp: number
    readonly level: number
    readonly streakDays: number
    readonly lastStudiedAt: Date
  }
): Promise<void> {
  await prisma.user.update({ where: { id: userId }, data })
}
