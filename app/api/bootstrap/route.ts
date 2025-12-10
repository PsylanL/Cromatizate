import { NextRequest, NextResponse } from 'next/server'
import { getVisitorId, ensureVisitorExists, createSimpleSupabaseClient } from '@/lib/api-helpers'

export async function POST(request: NextRequest) {
  try {
    const visitorId = getVisitorId(request)

    if (!visitorId) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'visitor_id is required. Make sure the middleware has set the visitor_id cookie'
        },
        { status: 400 }
      )
    }

    // Ensure visitor exists
    const visitor = await ensureVisitorExists(visitorId)

    if (!visitor) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to create or retrieve visitor'
        },
        { status: 500 }
      )
    }

    // Parse preferences
    const preferences = (visitor.preferences && typeof visitor.preferences === 'object' && !Array.isArray(visitor.preferences))
      ? visitor.preferences as Record<string, unknown>
      : {}

    return NextResponse.json(
      { 
        success: true, 
        data: {
          user: {
            id: visitor.id,
          },
          preferences: {
            colorProfile: visitor.colorBlindness || null,
            contrastLevel: typeof preferences.contrast === 'number' ? `${preferences.contrast}%` : '100%',
            labelPreference: preferences.textDescriptions ? 'enabled' : 'disabled',
            ...preferences
          },
        }
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error in bootstrap:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to bootstrap user',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

