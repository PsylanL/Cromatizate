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
 * Extracts userId from request in priority order:
 * 1. body.userId (explicit override)
 * 2. header x-user-id (injected by middleware)
 * 3. cookie user_id (SSR fallback)
 * @param request - Next.js request object
 * @param body - Optional pre-parsed body object
 * @returns userId string or null
 */
export function getUserIdFromRequest(
  request: Request | { headers: Headers; cookies: { get: (name: string) => { value: string } | undefined } },
  body?: Record<string, unknown>
): string | null {
  // Priority 1: Try to get from body first (explicit override)
  if (body && body.userId && typeof body.userId === 'string') {
    return body.userId
  }

  // Priority 2: Try to get from headers (injected by middleware)
  const headerUserId = request.headers.get('x-user-id')
  if (headerUserId) {
    return headerUserId
  }

  // Priority 3: Try to get from cookie (SSR fallback)
  if ('cookies' in request) {
    const cookieUserId = request.cookies.get('user_id')?.value
    if (cookieUserId) {
      return cookieUserId
    }
  }

  return null
}

