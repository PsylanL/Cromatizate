import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { getUserIdFromRequest } from '@/lib/api-helpers'
import { 
  generateColorBlindnessOntology, 
  generateRecommendations,
  type ColorBlindnessType 
} from '@/lib/ontology-helpers'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const domain = searchParams.get('domain') || 'colorBlindness'
    const colorBlindnessType = searchParams.get('type') as ColorBlindnessType | null

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

    // Try to get ontology from database (if table exists)
    let storedOntology = null
    try {
      const { data } = await supabase
        .from('Ontology')
        .select('*')
        .eq('domain', domain)
        .order('version', { ascending: false })
        .limit(1)
        .maybeSingle()
      
      storedOntology = data
    } catch {
      // Table might not exist yet, continue with generated ontology
      console.log('Ontology table not found, using generated ontology')
    }

    let jsonld: Record<string, unknown>
    let suggestions: Array<Record<string, unknown>> = []

    if (storedOntology) {
      // Use stored ontology
      jsonld = storedOntology.jsonld
      
      // Get rules if available
      if (storedOntology.rules) {
        suggestions = Array.isArray(storedOntology.rules) 
          ? storedOntology.rules as Array<Record<string, unknown>>
          : []
      }
    } else {
      // Generate ontology on the fly
      const type = colorBlindnessType || 'deuteranopia'
      jsonld = generateColorBlindnessOntology(type)
      
      // Generate suggestions based on type
      if (colorBlindnessType) {
        suggestions = generateRecommendations(colorBlindnessType, [], {})
      }
    }

    // Get user preferences if userId is available
    const userId = getUserIdFromRequest(request)
    if (userId && colorBlindnessType) {
      try {
        // Get user interactions to personalize recommendations
        const { data: interactions } = await supabase
          .from('VisitorInteraction')
          .select('*')
          .eq('visitorId', userId)
          .order('createdAt', { ascending: false })
          .limit(50)

        // Get user preferences
        const { data: visitor } = await supabase
          .from('Visitor')
          .select('preferences, colorBlindness')
          .eq('id', userId)
          .single()

        const userType = (visitor?.colorBlindness || colorBlindnessType) as ColorBlindnessType
        const userPreferences = visitor?.preferences || {}
        
        suggestions = generateRecommendations(
          userType,
          interactions || [],
          userPreferences
        )
      } catch (error) {
        // If tables don't exist, use basic recommendations
        console.log('Using basic recommendations without user data')
        suggestions = generateRecommendations(colorBlindnessType, [], {})
      }
    }

    // Return JSON-LD with Content-Type header
    return NextResponse.json(
      {
        "@context": (jsonld as Record<string, unknown>)["@context"],
        ...jsonld,
        "cromatizate:suggestions": suggestions
      },
      {
        status: 200,
        headers: {
          'Content-Type': 'application/ld+json',
        },
      }
    )
  } catch (error) {
    console.error('Error fetching ontology:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch ontology',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { domain, name, version, jsonld, rules } = body

    if (!domain || !name || !jsonld) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'domain, name, and jsonld are required'
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

    // Check if ontology exists
    const { data: existing } = await supabase
      .from('Ontology')
      .select('id')
      .eq('domain', domain)
      .eq('version', version || '1.0')
      .maybeSingle()

    let result
    if (existing) {
      // Update existing
      const { data, error } = await supabase
        .from('Ontology')
        .update({
          name,
          jsonld,
          rules: rules || null,
        })
        .eq('id', existing.id)
        .select()
        .single()

      if (error) throw error
      result = data
    } else {
      // Create new
      const { data, error } = await supabase
        .from('Ontology')
        .insert({
          domain,
          name,
          version: version || '1.0',
          jsonld,
          rules: rules || null,
        })
        .select()
        .single()

      if (error) throw error
      result = data
    }

    return NextResponse.json(
      { success: true, data: result },
      { status: existing ? 200 : 201 }
    )
  } catch (error) {
    console.error('Error creating/updating ontology:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create/update ontology',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

