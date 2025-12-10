import { NextRequest, NextResponse } from 'next/server'
import { getVisitorId, createSimpleSupabaseClient } from '@/lib/api-helpers'
import { 
  generateColorBlindnessOntology, 
  generateRecommendations,
  type ColorBlindnessType 
} from '@/lib/ontology-helpers'
import { generateVisualContentOntology } from '@/lib/semantic-agent'

/**
 * GET /api/ontologies
 * 
 * Returns ontology in JSON-LD format.
 * 
 * Rules:
 * - Read ontology from DB if exists
 * - If missing, generate via existing helper
 * - Return JSON-LD
 * - Optionally return recommendations ONLY IF rules + interactions exist
 * - Do NOT try to merge preferences or override them
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const domain = searchParams.get('domain') || 'colorBlindness'
    const colorBlindnessType = searchParams.get('type') as ColorBlindnessType | null

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
      jsonld = storedOntology.jsonld as Record<string, unknown>
      
      // Get rules if available
      if (storedOntology.rules) {
        suggestions = Array.isArray(storedOntology.rules) 
          ? storedOntology.rules as Array<Record<string, unknown>>
          : []
      }
    } else {
      // Generate ontology on the fly based on domain
      if (domain === 'visualContent') {
        jsonld = generateVisualContentOntology()
        suggestions = []
      } else {
        // Generate Color Blindness Ontology (default)
        const type = colorBlindnessType || 'deuteranopia'
        jsonld = generateColorBlindnessOntology(type)
        
        // Generate basic suggestions based on type
        if (colorBlindnessType) {
          suggestions = generateRecommendations(colorBlindnessType, [], {})
        }
      }
    }

    // Optional: Generate recommendations ONLY IF visitor exists AND has interactions
    // This is for agents to use, not for modifying preferences
    const visitorId = getVisitorId(request)
    if (visitorId && storedOntology?.rules) {
      try {
        // Get visitor interactions (last 50) - agents use this data
        let interactions: unknown[] = []
        try {
          const { data: interactionData } = await supabase
            .from('VisitorInteraction')
            .select('*')
            .eq('visitorId', visitorId)
            .order('createdAt', { ascending: false })
            .limit(50)
          
          interactions = interactionData || []
        } catch {
          interactions = []
        }

        // Get visitor data (agents read this, don't modify it)
        let visitor: { preferences: unknown; colorBlindness: string | null } | null = null
        try {
          const { data: visitorData } = await supabase
            .from('Visitor')
            .select('preferences, colorBlindness')
            .eq('id', visitorId)
            .maybeSingle()
          
          visitor = visitorData
        } catch {
          visitor = null
        }

        // Only generate recommendations if we have interactions AND visitor data
        if (interactions.length > 0 && visitor) {
          const userType = (visitor.colorBlindness || colorBlindnessType || 'normal') as ColorBlindnessType
          const userPreferences = (visitor.preferences && typeof visitor.preferences === 'object' && !Array.isArray(visitor.preferences))
            ? visitor.preferences as Record<string, unknown>
            : {}
          
          // Generate recommendations based on interactions + ontology rules
          // This is for agents, not for modifying preferences
          suggestions = generateRecommendations(
            userType,
            interactions as Array<Record<string, unknown>>,
            userPreferences
          )
        }
      } catch (error) {
        // If tables don't exist or error, use basic recommendations
        console.log('Could not fetch visitor data for recommendations:', error)
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

/**
 * POST /api/ontologies
 * 
 * Creates or updates an ontology in the database.
 * No user authentication required - ontologies are public knowledge.
 */
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

    // Check if ontology exists
    let existing
    try {
      const { data } = await supabase
        .from('Ontology')
        .select('id')
        .eq('domain', domain)
        .eq('version', version || '1.0')
        .maybeSingle()
      
      existing = data
    } catch (error) {
      console.log('Ontology table might not exist, will try to create:', error)
      existing = null
    }

    let result
    if (existing) {
      // Update existing
      const { data, error } = await supabase
        .from('Ontology')
        .update({
          name,
          jsonld,
          rules: rules || null,
          updatedAt: new Date().toISOString()
        })
        .eq('id', existing.id)
        .select()
        .single()

      if (error) {
        console.error('Error updating ontology:', error)
        throw error
      }
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
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        })
        .select()
        .single()

      if (error) {
        console.error('Error creating ontology:', error)
        throw error
      }
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
