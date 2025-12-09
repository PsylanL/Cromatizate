import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { getUserIdFromRequest } from '@/lib/api-helpers'
import { 
  generateRecommendations,
  analyzeInteractions,
  type ColorBlindnessType 
} from '@/lib/ontology-helpers'

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

    // Get user data
    const { data: visitor, error: visitorError } = await supabase
      .from('Visitor')
      .select('colorBlindness, preferences')
      .eq('id', userId)
      .single()

    if (visitorError || !visitor) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Visitor not found'
        },
        { status: 404 }
      )
    }

    // Get user interactions
    const { data: interactions } = await supabase
      .from('VisitorInteraction')
      .select('*')
      .eq('visitorId', userId)
      .order('createdAt', { ascending: false })
      .limit(100)

    // Get existing recommendations
    const { data: existingRecommendations } = await supabase
      .from('Recommendation')
      .select('*')
      .eq('visitorId', userId)
      .order('createdAt', { ascending: false })
      .limit(20)

    // Generate new recommendations based on current state
    const colorBlindnessType = (visitor.colorBlindness || 'normal') as ColorBlindnessType
    const preferences = visitor.preferences || {}
    const analyzedPrefs = analyzeInteractions(interactions || [])

    // Merge analyzed preferences with stored preferences
    const mergedPreferences = {
      ...preferences,
      contrast: analyzedPrefs.preferredContrast,
      saturation: analyzedPrefs.preferredSaturation,
      palette: analyzedPrefs.preferredPalette.length > 0 
        ? analyzedPrefs.preferredPalette 
        : preferences.palette
    }

    const newRecommendations = generateRecommendations(
      colorBlindnessType,
      interactions || [],
      mergedPreferences
    )

    // Store new recommendations if they don't exist
    if (newRecommendations.length > 0) {
      const recommendationsToInsert = newRecommendations.map(rec => ({
        visitorId: userId,
        type: rec.type,
        content: rec.content,
        confidence: rec.content.confidence || 0.5,
        source: rec.source
      }))

      // Check which recommendations are new
      const existingTypes = new Set(
        existingRecommendations?.map(r => `${r.type}-${JSON.stringify(r.content)}`) || []
      )

      const toInsert = recommendationsToInsert.filter(rec => {
        const key = `${rec.type}-${JSON.stringify(rec.content)}`
        return !existingTypes.has(key)
      })

      if (toInsert.length > 0) {
        await supabase
          .from('Recommendation')
          .insert(toInsert)
      }
    }

    // Return all recommendations (existing + new)
    const allRecommendations = [
      ...(existingRecommendations || []),
      ...newRecommendations.map(rec => ({
        id: 'new',
        type: rec.type,
        content: rec.content,
        confidence: rec.content.confidence || 0.5,
        source: rec.source,
        createdAt: new Date().toISOString()
      }))
    ]

    // Group by type and return most recent/highest confidence
    const grouped = allRecommendations.reduce((acc, rec) => {
      if (!acc[rec.type] || rec.confidence > acc[rec.type].confidence) {
        acc[rec.type] = rec
      }
      return acc
    }, {} as Record<string, any>)

    return NextResponse.json(
      { 
        success: true, 
        data: {
          recommendations: Object.values(grouped),
          userPreferences: mergedPreferences,
          colorBlindnessType,
          interactionCount: interactions?.length || 0
        }
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error fetching recommendations:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch recommendations',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, feedback, accepted } = body

    const userId = getUserIdFromRequest(request, body)

    if (!userId) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'userId is required'
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

    // Store feedback as interaction
    const { error: interactionError } = await supabase
      .from('VisitorInteraction')
      .insert({
        visitorId: userId,
        type: 'recommendation_feedback',
        payload: {
          recommendationType: type,
          feedback,
          accepted,
          timestamp: new Date().toISOString()
        }
      })

    if (interactionError) {
      throw interactionError
    }

    // If recommendation was accepted, update user preferences
    if (accepted && type) {
      const { data: recommendation } = await supabase
        .from('Recommendation')
        .select('content')
        .eq('visitorId', userId)
        .eq('type', type)
        .order('createdAt', { ascending: false })
        .limit(1)
        .single()

      if (recommendation?.content) {
        // Update visitor preferences based on accepted recommendation
        const { data: visitor } = await supabase
          .from('Visitor')
          .select('preferences')
          .eq('id', userId)
          .single()

        const currentPrefs = visitor?.preferences || {}
        const newPrefs = {
          ...currentPrefs,
          [type]: recommendation.content
        }

        await supabase
          .from('Visitor')
          .update({ preferences: newPrefs })
          .eq('id', userId)
      }
    }

    return NextResponse.json(
      { success: true, message: 'Feedback recorded' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error recording feedback:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to record feedback',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

