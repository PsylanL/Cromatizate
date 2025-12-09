import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getUserIdFromRequest } from '@/lib/api-helpers'

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

    // Get userId in priority order: body.userId > header x-user-id > cookie user_id
    const userId = getUserIdFromRequest(request, body)

    // If no userId is found anywhere, return 400 error
    if (!userId) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'userId is required. Provide it in request body, x-user-id header, or user_id cookie'
        },
        { status: 400 }
      )
    }

    // Initialize Supabase client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Check if visitor exists in Visitor table
    const { data: existingVisitor } = await supabase
      .from('Visitor')
      .select('id')
      .eq('id', userId)
      .single()

    // If visitor doesn't exist, insert it
    if (!existingVisitor) {
      const { error: insertError } = await supabase
        .from('Visitor')
        .insert({ id: userId })

      if (insertError) {
        console.error('Error creating visitor:', insertError)
        return NextResponse.json(
          { 
            success: false, 
            error: 'Failed to create visitor',
            message: insertError.message
          },
          { status: 500 }
        )
      }
    }

    // Create session with userId and metadata
    const { data: session, error: sessionError } = await supabase
      .from('Sessions')
      .insert({
        user_id: userId,
        metadata,
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

    // Return standardized JSON format
    return NextResponse.json(
      { 
        success: true, 
        data: session 
      },
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

