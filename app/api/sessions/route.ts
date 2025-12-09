import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
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
      console.error('Missing Supabase environment variables:', {
        hasUrl: !!supabaseUrl,
        hasKey: !!supabaseKey,
      })
      return NextResponse.json(
        { 
          success: false, 
          error: 'Server configuration error: Supabase credentials are missing',
          message: 'NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY must be set'
        },
        { status: 500 }
      )
    }

    // Initialize Supabase with Publishable Key + Request Cookies
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

    // Check if visitor exists
    const { data: existingVisitor } = await supabase
      .from('Visitor')
      .select('id')
      .eq('id', userId)
      .maybeSingle()

      if (!existingVisitor) {
        const { error: insertError } = await supabase
          .from('Visitor')
          .insert({ 
            id: userId,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          })
      
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

    // Create session
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