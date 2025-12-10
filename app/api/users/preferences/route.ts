import { NextRequest, NextResponse } from 'next/server'
import { getVisitorId, createSimpleSupabaseClient, ensureVisitorExists } from '@/lib/api-helpers'

/**
 * GET /api/users/preferences
 * 
 * Returns raw preferences from database.
 * No merging, no inference, no transformation.
 * Frontend owns all preference state.
 */
export async function GET(request: NextRequest) {
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

    // Create Supabase client first
    let supabase
    try {
      supabase = createSimpleSupabaseClient()
    } catch (error) {
      console.error('Supabase client creation failed:', error)
      return NextResponse.json(
        { 
          success: false, 
          error: 'Server configuration error: Supabase credentials are missing'
        },
        { status: 500 }
      )
    }

    // Fetch visitor directly - don't use ensureVisitorExists as it creates empty visitor
    const { data: visitor, error: fetchError } = await supabase
      .from('Visitor')
      .select('id, preferences, colorBlindness')
      .eq('id', visitorId)
      .maybeSingle()

    if (fetchError) {
      console.error('Error fetching visitor:', fetchError)
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to fetch visitor',
          message: fetchError.message
        },
        { status: 500 }
      )
    }

    // If visitor doesn't exist, return empty preferences (don't create here)
    if (!visitor) {
      console.log('📥 [GET] Visitor not found, returning empty preferences')
      return NextResponse.json(
        { 
          success: true, 
          data: {
            preferences: {},
            colorBlindness: null
          }
        },
        { status: 200 }
      )
    }

    console.log('📥 [GET] Visitor data:', {
      visitorId,
      hasPreferences: !!visitor.preferences,
      preferencesType: typeof visitor.preferences,
      colorBlindness: visitor.colorBlindness,
      preferencesKeys: visitor.preferences && typeof visitor.preferences === 'object' ? Object.keys(visitor.preferences as Record<string, unknown>) : []
    })

    // Return raw preferences - no transformation
    const rawPreferences = visitor.preferences
    
    // Parse JSON if string (legacy support)
    let preferences: Record<string, unknown> = {}
    if (rawPreferences) {
      if (typeof rawPreferences === 'string') {
        try {
          preferences = JSON.parse(rawPreferences) as Record<string, unknown>
        } catch {
          preferences = {}
        }
      } else if (typeof rawPreferences === 'object' && !Array.isArray(rawPreferences) && rawPreferences !== null) {
        preferences = rawPreferences as Record<string, unknown>
      }
    }

    console.log('📤 [GET] Returning preferences:', {
      preferences,
      colorBlindness: visitor.colorBlindness,
      preferencesKeys: Object.keys(preferences)
    })

    return NextResponse.json(
      { 
        success: true, 
        data: {
          preferences, // Raw preferences object
          colorBlindness: visitor.colorBlindness // Raw colorBlindness field
        }
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error fetching preferences:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch preferences',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/users/preferences
 * 
 * Overwrites preferences with exactly what the frontend sends.
 * No merging, no fallback logic, no inference.
 * Backend only stores raw data.
 */
export async function POST(request: NextRequest) {
  try {
    const visitorId = getVisitorId(request)
    const body = await request.json()
    const { preferences } = body

    if (!visitorId) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'visitor_id is required. Make sure the middleware has set the visitor_id cookie'
        },
        { status: 400 }
      )
    }

    if (!preferences || typeof preferences !== 'object' || Array.isArray(preferences)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'preferences must be a valid object'
        },
        { status: 400 }
      )
    }

    // Create Supabase client
    let supabase
    try {
      supabase = createSimpleSupabaseClient()
    } catch (error) {
      console.error('Supabase client creation failed:', error)
      return NextResponse.json(
        { 
          success: false, 
          error: 'Server configuration error: Supabase credentials are missing'
        },
        { status: 500 }
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

    // Extract colorBlindness from preferences.type if present (for legacy support) 
    const colorBlindness = preferences.type && preferences.type !== 'normal' 
      ? String(preferences.type) 
      : null

    console.log('💾 [POST] Saving preferences:', {
      visitorId,
      preferences,
      colorBlindness,
      preferencesType: preferences.type
    })

    // Update visitor with exactly what frontend sent - no merging
    const { error: updateError } = await supabase
      .from('Visitor')
      .update({
        preferences, // Store exactly what frontend sent
        colorBlindness, // Update colorBlindness for legacy support
        updatedAt: new Date().toISOString()
      })
      .eq('id', visitorId)

    if (updateError) {
      console.error('❌ [POST] Error updating preferences:', updateError)
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to update preferences',
          message: updateError.message
        },
        { status: 500 }
      )
    }

    console.log('✅ [POST] Update query executed successfully')

    // Fetch the updated data to verify it was saved
    const { data: verifyData, error: verifyError } = await supabase
      .from('Visitor')
      .select('id, preferences, colorBlindness')
      .eq('id', visitorId)
      .maybeSingle()

    if (verifyError) {
      console.warn('⚠️ [POST] Could not verify saved data:', verifyError)
    } else if (verifyData) {
      console.log('✅ [POST] Verified saved data:', {
        id: verifyData.id,
        preferences: verifyData.preferences,
        colorBlindness: verifyData.colorBlindness,
        matchesSent: JSON.stringify(verifyData.preferences) === JSON.stringify(preferences)
      })
    } else {
      console.warn('⚠️ [POST] Visitor not found after update')
    }

    // Return exactly what we stored
    return NextResponse.json(
      { 
        success: true, 
        data: {
          preferences, // Return exactly what was stored
          colorBlindness
        }
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error updating preferences:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to update preferences',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
