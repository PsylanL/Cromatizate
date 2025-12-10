import { NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'

/**
 * REGLA 2: Método único de identificación
 * Extrae visitor_id desde cookies (única fuente de identidad)
 * @param request - Next.js request object
 * @returns visitor_id string or null
 */
export function getVisitorId(request: NextRequest): string | null {
  // Try visitor_id first (new standard)
  const visitorId = request.cookies.get('visitor_id')?.value
  if (visitorId) {
    return visitorId
  }

  // Fallback to user_id for backward compatibility
  const userId = request.cookies.get('user_id')?.value
  if (userId) {
    return userId
  }

  return null
}

/**
 * Creates a simple Supabase client without Auth/SSR
 * Uses only the publishable key for direct table access
 */
export function createSimpleSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase environment variables: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY must be set')
  }

  return createClient(supabaseUrl, supabaseKey)
}

/**
 * Ensures a visitor exists in the Visitor table, creating it if necessary
 * @param visitorId - The visitor ID to check/create
 * @returns The visitor object or null if creation fails
 */
export async function ensureVisitorExists(visitorId: string): Promise<{ id: string; preferences: unknown; colorBlindness: string | null } | null> {
  const supabase = createSimpleSupabaseClient()

  // Check if visitor exists
  const { data: existingVisitor } = await supabase
    .from('Visitor')
    .select('id, preferences, colorBlindness')
    .eq('id', visitorId)
    .maybeSingle()

  if (existingVisitor) {
    return existingVisitor
  }

  // Create visitor if doesn't exist
  const { data: newVisitor, error } = await supabase
    .from('Visitor')
    .insert({
      id: visitorId,
      preferences: {},
      colorBlindness: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    })
    .select('id, preferences, colorBlindness')
    .single()

  if (error) {
    console.error('Error creating visitor:', error)
    return null
  }

  return newVisitor
}

