import { PrismaClient } from '@prisma/client'
import { validateEnv } from './env'

// Validate environment variables before creating Prisma client
validateEnv()

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
