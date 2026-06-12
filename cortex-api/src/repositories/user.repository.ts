import { PrismaClient, User } from '@prisma/client'
import { UserDTO } from '../types/domain.types'

interface CreateUserInput {
  readonly email: string
  readonly name: string
  readonly passwordHash?: string
}

interface UpsertAccountInput {
  readonly userId: string
  readonly provider: string
  readonly providerAccountId: string
  readonly accessToken?: string
}

function toUserDTO(user: User & { goal: { targetScore: number } | null }): UserDTO {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    image: user.image,
    xp: user.xp,
    level: user.level,
    streakDays: user.streakDays,
    hasCompletedOnboarding: user.goal !== null,
  }
}

/** Repository for User model. All DB access for users goes through here. */
export class UserRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findByEmail(email: string): Promise<(User & { goal: { targetScore: number } | null }) | null> {
    return this.prisma.user.findUnique({
      where: { email },
      include: { goal: { select: { targetScore: true } } },
    })
  }

  async findById(id: string): Promise<(User & { goal: { targetScore: number } | null }) | null> {
    return this.prisma.user.findUnique({
      where: { id },
      include: { goal: { select: { targetScore: true } } },
    })
  }

  async create(input: CreateUserInput): Promise<UserDTO> {
    const user = await this.prisma.user.create({
      data: input,
      include: { goal: { select: { targetScore: true } } },
    })
    return toUserDTO(user)
  }

  async update(
    id: string,
    data: Partial<Pick<User, 'name' | 'image' | 'xp' | 'level' | 'streakDays' | 'lastStudiedAt'>>,
  ): Promise<void> {
    await this.prisma.user.update({ where: { id }, data })
  }

  async upsertAccount(input: UpsertAccountInput): Promise<void> {
    await this.prisma.account.upsert({
      where: {
        provider_providerAccountId: {
          provider: input.provider,
          providerAccountId: input.providerAccountId,
        },
      },
      update: { accessToken: input.accessToken ?? null },
      create: {
        userId: input.userId,
        provider: input.provider,
        providerAccountId: input.providerAccountId,
        accessToken: input.accessToken ?? null,
      },
    })
  }

  async upsertGoal(userId: string, targetScore: number): Promise<void> {
    await this.prisma.goal.upsert({
      where: { userId },
      update: { targetScore },
      create: { userId, targetScore },
    })
  }

  toDTO(user: User & { goal: { targetScore: number } | null }): UserDTO {
    return toUserDTO(user)
  }
}
