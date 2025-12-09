import { prisma } from '@/lib/prisma'

/**
 * Ensures a user exists in the database, creating it if necessary
 * @param userId - The user ID to check/create
 * @returns The user object
 */
export async function ensureUserExists(userId: string) {
  let user = await prisma.user.findUnique({
    where: { id: userId },
    include: { preferences: true },
  })

  if (!user) {
    user = await prisma.user.create({
      data: { id: userId },
      include: { preferences: true },
    })
  }

  return user
}

/**
 * Extracts userId from request body or headers
 * Note: This will consume the request body, so call it before other body reads
 * @param request - Next.js request object
 * @param body - Optional pre-parsed body object
 * @returns userId string or null
 */
export function getUserIdFromRequest(request: Request, body?: any): string | null {
  // Try to get from body first (if provided)
  if (body && body.userId && typeof body.userId === 'string') {
    return body.userId
  }

  // Try to get from headers
  const headerUserId = request.headers.get('x-user-id')
  if (headerUserId) {
    return headerUserId
  }

  return null
}

