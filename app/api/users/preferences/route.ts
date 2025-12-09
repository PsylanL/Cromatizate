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
    const { data: visitor, error } = await supabase
      .from('Visitor')
      .select('colorBlindness, preferences')
      .eq('id', userId)
      .single()

    if (error) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Visitor not found',
          message: error.message
        },
        { status: 404 }
      )
    }

    const prefs = visitor?.preferences || {}
    const colorProfile = visitor?.colorBlindness || 'normal'

    return NextResponse.json(
      { 
        success: true, 
        data: {
          colorProfile,
          contrastLevel: prefs.contrast ? `${prefs.contrast}%` : '100%',
          labelPreference: prefs.textDescriptions ? 'enabled' : 'disabled',
          preferences: prefs
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
    const { data: existingVisitor } = await supabase
      .from('Visitor')
      .select('id, preferences, colorBlindness')
      .eq('id', userId)
      .maybeSingle()

    if (!existingVisitor) {
      // Create visitor if doesn't exist
      const { error: createError } = await supabase
        .from('Visitor')
        .insert({
          id: userId,
          colorBlindness: colorProfile || null,
          preferences: preferences || {},
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        })

      if (createError) {
        throw createError
      }
    } else {
      // Update visitor preferences
      const currentPrefs = existingVisitor.preferences || {}
      const updatedPrefs = preferences 
        ? { ...currentPrefs, ...preferences }
        : currentPrefs

      const updateData: any = {
        updatedAt: new Date().toISOString()
      }

      if (colorProfile !== undefined) updateData.colorBlindness = colorProfile
      if (preferences !== undefined) updateData.preferences = updatedPrefs

      const { error: updateError } = await supabase
        .from('Visitor')
        .update(updateData)
        .eq('id', userId)

      if (updateError) {
        throw updateError
      }
    }

    return NextResponse.json(
      { 
        success: true, 
        data: {
          colorProfile: colorProfile || existingVisitor?.colorBlindness,
          preferences: preferences || existingVisitor?.preferences
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

