import { NextRequest, NextResponse } from 'next/server'
import { getVisitorId, ensureVisitorExists } from '@/lib/api-helpers'

export async function POST(request: NextRequest) {
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

    // Ensure visitor exists (creates if doesn't exist)
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

    return NextResponse.json(
      { success: true, data: visitor },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating user:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create user',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

