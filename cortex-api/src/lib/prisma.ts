import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { config } from '../config'

const adapter = new PrismaPg({ connectionString: config.DATABASE_URL })

/** Singleton PrismaClient instance for use across all repositories. */
export const prisma = new PrismaClient({ adapter })
