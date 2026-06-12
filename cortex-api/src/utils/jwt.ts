import jwt from 'jsonwebtoken'
import { config } from '../config'

/** Signs an access token for the given userId. Expires per JWT_ACCESS_EXPIRES_IN. */
export function signAccessToken(userId: string): string {
  return jwt.sign({ sub: userId }, config.JWT_ACCESS_SECRET, {
    expiresIn: config.JWT_ACCESS_EXPIRES_IN,
  } as jwt.SignOptions)
}

/** Signs a refresh token for the given userId. Expires per JWT_REFRESH_EXPIRES_IN. */
export function signRefreshToken(userId: string): string {
  return jwt.sign({ sub: userId }, config.JWT_REFRESH_SECRET, {
    expiresIn: config.JWT_REFRESH_EXPIRES_IN,
  } as jwt.SignOptions)
}

/** Verifies an access token. Returns userId string or null if invalid/expired. */
export function verifyAccessToken(token: string): string | null {
  try {
    const payload = jwt.verify(token, config.JWT_ACCESS_SECRET) as { sub: string }
    return payload.sub
  } catch {
    return null
  }
}

/** Verifies a refresh token. Returns userId string or null if invalid/expired. */
export function verifyRefreshToken(token: string): string | null {
  try {
    const payload = jwt.verify(token, config.JWT_REFRESH_SECRET) as { sub: string }
    return payload.sub
  } catch {
    return null
  }
}
