import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { getUserIdFromRequest } from '@/lib/api-helpers'

export async function GET(request: NextRequest) {
  try {
    const userId = getUserIdFromRequest(request)

    if (!userId) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'userId is required. Provide it in request body, x-user-id header, or user_id cookie'
        },
        { status: 400 }
      )
    }

    // Validate Supabase environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Server configuration error: Supabase credentials are missing'
        },
        { status: 500 }
      )
    }

    const supabase = createServerClient(
      supabaseUrl,
      supabaseKey,
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value
          },
        },
      }
    )

    // Get visitor preferences
    console.log('🔍 Fetching visitor with userId:', userId)
    const { data: visitor, error } = await supabase
      .from('Visitor')
      .select('id, colorBlindness, preferences, updatedAt')
      .eq('id', userId)
      .single()

    console.log('🔍 Visitor query result:', { visitor, error })

    if (error) {
      // If visitor doesn't exist, return empty preferences (not an error)
      if (error.code === 'PGRST116') {
        console.log('⚠️ Visitor not found, returning empty preferences')
        return NextResponse.json(
          { 
            success: true, 
            data: {
              colorProfile: null,
              contrastLevel: '100%',
              labelPreference: 'disabled',
              preferences: {}
            }
          },
          { status: 200 }
        )
      }
      
      console.error('❌ Error fetching visitor:', error)
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to fetch visitor',
          message: error.message
        },
        { status: 500 }
      )
    }

    // Handle null/undefined/string preferences from old visitors
    const rawPrefs = visitor?.preferences
    let prefs: Record<string, unknown> = {}
    
    if (rawPrefs) {
      if (typeof rawPrefs === 'string') {
        try {
          prefs = JSON.parse(rawPrefs) as Record<string, unknown>
        } catch {
          prefs = {}
        }
      } else if (typeof rawPrefs === 'object' && !Array.isArray(rawPrefs) && rawPrefs !== null) {
        prefs = rawPrefs as Record<string, unknown>
      }
    }
    
    // Ensure it's always an object
    const safePrefs: Record<string, unknown> = typeof prefs === 'object' && !Array.isArray(prefs) ? prefs : {}
    
    // Return the actual colorBlindness value (could be null, or a string like 'tritanopia')
    const colorProfile = visitor?.colorBlindness || null

    console.log('📤 Returning preferences:', {
      userId,
      visitorId: visitor?.id,
      colorProfile,
      colorBlindness: visitor?.colorBlindness,
      preferences: safePrefs,
      preferencesRaw: rawPrefs,
      preferencesType: typeof rawPrefs,
      updatedAt: visitor?.updatedAt
    })

    return NextResponse.json(
      { 
        success: true, 
        data: {
          colorProfile,
          contrastLevel: typeof safePrefs.contrast === 'number' ? `${safePrefs.contrast}%` : '100%',
          labelPreference: safePrefs.textDescriptions ? 'enabled' : 'disabled',
          preferences: safePrefs
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

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const userId = getUserIdFromRequest(request, body)
    
    const { colorProfile, contrastLevel, labelPreference, preferences } = body

    if (!userId) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'userId is required. Provide it in request body, x-user-id header, or user_id cookie'
        },
        { status: 400 }
      )
    }

    // Validate Supabase environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Server configuration error: Supabase credentials are missing'
        },
        { status: 500 }
      )
    }

    const supabase = createServerClient(
      supabaseUrl,
      supabaseKey,
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value
          },
        },
      }
    )

    // Ensure visitor exists
    console.log('💾 Saving preferences for userId:', userId)
    console.log('💾 Payload received:', { colorProfile, preferences, contrastLevel, labelPreference })
    
    const { data: existingVisitor } = await supabase
      .from('Visitor')
      .select('id, preferences, colorBlindness')
      .eq('id', userId)
      .maybeSingle()

    console.log('💾 Existing visitor:', existingVisitor)

    if (!existingVisitor) {
      // Create visitor if doesn't exist
      const insertData = {
        id: userId,
        colorBlindness: colorProfile === null || colorProfile === 'normal' ? null : colorProfile,
        preferences: preferences || {},
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      console.log('💾 Creating new visitor with:', insertData)
      
      const { data: newVisitor, error: createError } = await supabase
        .from('Visitor')
        .insert(insertData)
        .select()
        .single()

      if (createError) {
        console.error('❌ Error creating visitor:', createError)
        throw createError
      }
      
      console.log('✅ Visitor created:', newVisitor)
      
      return NextResponse.json(
        { 
          success: true, 
          data: {
            colorProfile: newVisitor.colorBlindness,
            preferences: newVisitor.preferences
          }
        },
        { status: 200 }
      )
    } else {
      // Update visitor preferences
      // Handle null/undefined/string preferences from old visitors
      const rawCurrentPrefs = existingVisitor.preferences
      let currentPrefs = {}
      
      if (rawCurrentPrefs) {
        if (typeof rawCurrentPrefs === 'string') {
          try {
            currentPrefs = JSON.parse(rawCurrentPrefs)
          } catch {
            currentPrefs = {}
          }
        } else if (typeof rawCurrentPrefs === 'object' && !Array.isArray(rawCurrentPrefs)) {
          currentPrefs = rawCurrentPrefs
        }
      }
      
      // Ensure currentPrefs is always an object
      const safeCurrentPrefs = typeof currentPrefs === 'object' && !Array.isArray(currentPrefs) ? currentPrefs : {}
      
      const updatedPrefs = preferences 
        ? { ...safeCurrentPrefs, ...preferences }
        : safeCurrentPrefs

      const updateData: {
        updatedAt: string
        colorBlindness?: string | null
        preferences?: Record<string, unknown>
      } = {
        updatedAt: new Date().toISOString()
      }

      // Always update colorBlindness if provided (even if null)
      if (colorProfile !== undefined) {
        updateData.colorBlindness = colorProfile === null || colorProfile === 'normal' ? null : colorProfile
      }
      
      // Always update preferences (ensure it's an object, not null)
      if (preferences !== undefined) {
        updateData.preferences = updatedPrefs
      } else if (rawCurrentPrefs === null || rawCurrentPrefs === undefined) {
        // Fix old visitors that have null/undefined preferences
        updateData.preferences = {}
      }

      console.log('💾 Updating visitor with:', updateData)
      console.log('💾 Current preferences before update:', {
        raw: rawCurrentPrefs,
        parsed: safeCurrentPrefs,
        type: typeof rawCurrentPrefs
      })

      const { data: updatedVisitor, error: updateError } = await supabase
        .from('Visitor')
        .update(updateData)
        .eq('id', userId)
        .select()
        .single()

      if (updateError) {
        console.error('❌ Error updating visitor:', updateError)
        throw updateError
      }

      // Parse updated preferences to ensure they're valid
      let updatedPrefsParsed = {}
      if (updatedVisitor.preferences) {
        if (typeof updatedVisitor.preferences === 'string') {
          try {
            updatedPrefsParsed = JSON.parse(updatedVisitor.preferences)
          } catch {
            updatedPrefsParsed = {}
          }
        } else if (typeof updatedVisitor.preferences === 'object' && !Array.isArray(updatedVisitor.preferences)) {
          updatedPrefsParsed = updatedVisitor.preferences
        }
      }

      console.log('✅ Visitor updated:', updatedVisitor)
      console.log('✅ Updated visitor data:', {
        colorBlindness: updatedVisitor.colorBlindness,
        preferences: updatedPrefsParsed,
        preferencesRaw: updatedVisitor.preferences,
        preferencesType: typeof updatedVisitor.preferences
      })

      return NextResponse.json(
        { 
          success: true, 
          data: {
            colorProfile: updatedVisitor.colorBlindness,
            preferences: updatedPrefsParsed || {}
          }
        },
        { status: 200 }
      )
    }
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

