import { NextRequest, NextResponse } from 'next/server'
import { getVisitorId, createSimpleSupabaseClient, ensureVisitorExists } from '@/lib/api-helpers'

/**
 * POST /api/sessions
 * 
 * Creates a new session for the visitor.
 * REGLA 5: Usa visitor_id como userId, asegura que Visitor exista, inserta en Sessions
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { metadata } = body

    // Validate metadata exists and is an object
    if (!metadata || typeof metadata !== 'object' || Array.isArray(metadata)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Metadata is required and must be an object'
        },
        { status: 400 }
      )
    }

    // REGLA 5: Usar visitor_id como userId
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

    // Validate Supabase environment variables
    let supabase
    try {
      supabase = createSimpleSupabaseClient()
    } catch (error) {
      console.error('Supabase client creation failed:', error)
      return NextResponse.json(
        { 
          success: false, 
          error: 'Server configuration error: Supabase credentials are missing',
          message: 'NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY must be set'
        },
        { status: 500 }
      )
    }

    // REGLA 5: Asegurar que el visitante exista en Visitor
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

    // REGLA 5: Insertar un registro en Sessions con metadata
    let session
    try {
      const { data: sessionData, error: sessionError } = await supabase
        .from('Sessions')
        .insert({
          user_id: visitorId, // Use visitor_id as userId
          metadata,
          createdAt: new Date().toISOString()
        })
        .select()
        .single()

      if (sessionError) {
        console.error('Error creating session:', sessionError)
        return NextResponse.json(
          { 
            success: false, 
            error: 'Failed to create session',
            message: sessionError.message
          },
          { status: 500 }
        )
      }

      session = sessionData
    } catch (error) {
      console.error('Error inserting session:', error)
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to create session',
          message: error instanceof Error ? error.message : 'Unknown error'
        },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { success: true, data: session },
      { status: 201 }
    )

  } catch (error) {
    console.error('Error creating session:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create session',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
