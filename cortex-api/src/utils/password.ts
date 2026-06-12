import bcrypt from 'bcryptjs'

const SALT_ROUNDS = 12

/** Hashes a plaintext password with bcrypt. */
export async function hashPassword(plaintext: string): Promise<string> {
  return bcrypt.hash(plaintext, SALT_ROUNDS)
}

/** Compares a plaintext password against a bcrypt hash. */
export async function comparePassword(
  plaintext: string,
  hash: string,
): Promise<boolean> {
  return bcrypt.compare(plaintext, hash)
}
