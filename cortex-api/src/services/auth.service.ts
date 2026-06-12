import { UserRepository } from '../repositories/user.repository'
import { hashPassword, comparePassword } from '../utils/password'
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/jwt'
import { UserDTO, TokenPair } from '../types/domain.types'

interface RegisterInput {
  readonly name: string
  readonly email: string
  readonly password: string
}

interface LoginInput {
  readonly email: string
  readonly password: string
}

interface AuthResult {
  readonly user: UserDTO
  readonly accessToken: string
  readonly refreshToken: string
}

interface ServiceError {
  readonly code: 'CONFLICT' | 'UNAUTHORIZED' | 'NOT_FOUND'
  readonly message: string
}

function createError(code: ServiceError['code'], message: string): ServiceError & Error {
  return Object.assign(new Error(message), { code })
}

/** Service handling user registration, login, token refresh, and Google OAuth. */
export class AuthService {
  constructor(private readonly userRepo: UserRepository) {}

  async register(input: RegisterInput): Promise<AuthResult> {
    const existing = await this.userRepo.findByEmail(input.email)
    if (existing) throw createError('CONFLICT', 'Email já cadastrado')

    const passwordHash = await hashPassword(input.password)
    const dto = await this.userRepo.create({
      email: input.email,
      name: input.name,
      passwordHash,
    })

    return {
      user: dto,
      accessToken: signAccessToken(dto.id),
      refreshToken: signRefreshToken(dto.id),
    }
  }

  async login(input: LoginInput): Promise<AuthResult> {
    const user = await this.userRepo.findByEmail(input.email)
    if (!user) throw createError('UNAUTHORIZED', 'Credenciais inválidas')
    if (!user.passwordHash) throw createError('UNAUTHORIZED', 'Use login social')

    const valid = await comparePassword(input.password, user.passwordHash)
    if (!valid) throw createError('UNAUTHORIZED', 'Credenciais inválidas')

    return {
      user: this.userRepo.toDTO(user),
      accessToken: signAccessToken(user.id),
      refreshToken: signRefreshToken(user.id),
    }
  }

  refresh(token: string): TokenPair {
    const userId = verifyRefreshToken(token)
    if (!userId) throw createError('UNAUTHORIZED', 'Refresh token inválido')

    return {
      accessToken: signAccessToken(userId),
      refreshToken: signRefreshToken(userId),
    }
  }

  async loginWithGoogle(input: {
    readonly email: string
    readonly name: string
    readonly image?: string
    readonly providerAccountId: string
  }): Promise<AuthResult> {
    const existing = await this.userRepo.findByEmail(input.email)

    const userId = existing
      ? existing.id
      : (await this.userRepo.create({ email: input.email, name: input.name })).id

    await this.userRepo.upsertAccount({
      userId,
      provider: 'google',
      providerAccountId: input.providerAccountId,
    })

    const user = await this.userRepo.findById(userId)
    if (!user) throw createError('NOT_FOUND', 'User not found after upsert')

    return {
      user: this.userRepo.toDTO(user),
      accessToken: signAccessToken(userId),
      refreshToken: signRefreshToken(userId),
    }
  }
}
