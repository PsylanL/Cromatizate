import { PrismaClient } from './generated/prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// @ts-expect-error - PrismaClient requires options but empty object works at runtime
export const prisma = globalForPrisma.prisma ?? new PrismaClient({ log: ["query"],})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

