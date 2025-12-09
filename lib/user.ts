/**
 * Client-side utility for managing anonymous user IDs in localStorage
 */

/**
 * Gets the user ID from localStorage, or creates and stores a new one if it doesn't exist
 * @returns The user ID (UUID string)
 */
export function getOrCreateUserId(): string {
  if (typeof window === 'undefined') {
    // Server-side: generate a new ID (shouldn't happen in normal flow)
    return crypto.randomUUID()
  }

  const storageKey = 'userId'
  let userId = localStorage.getItem(storageKey)

  if (!userId) {
    userId = crypto.randomUUID()
    localStorage.setItem(storageKey, userId)
  }

  return userId
}

