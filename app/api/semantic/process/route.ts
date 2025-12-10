import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { getVisitorId } from '@/lib/api-helpers'
import {
  processVisualContent,
  generateAdaptationSuggestions,
  analyzeColors,
  type VisualContent,
  type ColorBlindnessType
} from '@/lib/semantic-agent'

/**
 * POST /api/semantic/process
 * 
 * Procesa contenido visual del Agente Local y genera:
 * - Metadatos semánticos en JSON-LD
 * - Descripciones textuales inferidas
 * - Sugerencias de adaptación basadas en ontologías
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { inputType, inputData } = body

    if (!inputType || !inputData) {
      return NextResponse.json(
        {
          success: false,
          error: 'inputType and inputData are required'
        },
        { status: 400 }
      )
    }

    const userId = getVisitorId(request)

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

    // Get user color blindness type for personalized processing
    let colorBlindnessType: ColorBlindnessType | undefined = undefined
    try {
      const { data: visitor } = await supabase
        .from('Visitor')
        .select('colorBlindness')
        .eq('id', userId)
        .single()

      if (visitor?.colorBlindness) {
        colorBlindnessType = visitor.colorBlindness as ColorBlindnessType
      }
    } catch (error) {
      console.log('Could not fetch visitor preferences, using default processing')
    }

    // Process visual content based on input type
    let visualContent: VisualContent
    let jsonld: Record<string, unknown>
    let recommendations: Array<Record<string, unknown>> = []

    if (inputType === 'image') {
      // Extract colors and objects from input data
      const colors = inputData.colors || []
      const objects = inputData.objects || []
      const source = inputData.source || inputData.url || 'unknown'

      visualContent = {
        type: 'image',
        source,
        colors,
        objects,
        metadata: inputData.metadata || {}
      }

      // Analyze colors
      const colorAnalysis = analyzeColors(colors)

      // Process and generate JSON-LD
      jsonld = processVisualContent(visualContent, colorBlindnessType)

      // Generate adaptation suggestions
      if (colorBlindnessType && colorBlindnessType !== 'normal') {
        recommendations = generateAdaptationSuggestions(
          visualContent,
          colorBlindnessType,
          colorAnalysis
        )
      }
    } else if (inputType === 'color') {
      const colors = Array.isArray(inputData) ? inputData : [inputData]
      
      visualContent = {
        type: 'color',
        colors: colors.filter(c => typeof c === 'string'),
        metadata: inputData.metadata || {}
      }

      jsonld = processVisualContent(visualContent, colorBlindnessType)
    } else {
      return NextResponse.json(
        {
          success: false,
          error: `Unsupported inputType: ${inputType}. Supported types: image, color`
        },
        { status: 400 }
      )
    }

    // Store semantic output in database
    let semanticOutputId: string | null = null
    try {
      const { data: semanticOutput, error: insertError } = await supabase
        .from('SemanticOutput')
        .insert({
          visitorId: userId,
          inputType,
          inputData,
          jsonld,
          recommendations: recommendations.length > 0 ? recommendations : null
        })
        .select()
        .single()

      if (insertError) {
        console.error('Error storing semantic output:', insertError)
        // Continue anyway - return the result even if storage fails
      } else {
        semanticOutputId = semanticOutput.id
      }
    } catch (error) {
      console.log('SemanticOutput table might not exist, continuing without storage')
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          id: semanticOutputId,
          inputType,
          jsonld,
          recommendations,
          colorBlindnessType: colorBlindnessType || null
        }
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error processing semantic content:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to process semantic content',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

/**
 * GET /api/semantic/process
 * 
 * Retrieve semantic outputs for a user
 */
export async function GET(request: NextRequest) {
  try {
    const userId = getVisitorId(request)

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          error: 'userId is required. Provide it in request body, x-user-id header, or user_id cookie'
        },
        { status: 400 }
      )
    }

    const searchParams = request.nextUrl.searchParams
    const limit = parseInt(searchParams.get('limit') || '10')

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

    // Get semantic outputs
    try {
      const { data: outputs, error } = await supabase
        .from('SemanticOutput')
        .select('*')
        .eq('visitorId', userId)
        .order('createdAt', { ascending: false })
        .limit(limit)

      if (error) {
        throw error
      }

      return NextResponse.json(
        {
          success: true,
          data: outputs || []
        },
        { status: 200 }
      )
    } catch (error) {
      console.log('SemanticOutput table might not exist')
      return NextResponse.json(
        {
          success: true,
          data: []
        },
        { status: 200 }
      )
    }
  } catch (error) {
    console.error('Error fetching semantic outputs:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch semantic outputs',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}


