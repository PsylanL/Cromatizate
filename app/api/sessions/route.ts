import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ensureUserExists, getUserIdFromRequest } from '@/lib/api-helpers'

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

    // Ensure user exists (creates if doesn't exist)
    await ensureUserExists(userId)

    // Create session with userId and metadata
    const session = await prisma.session.create({
      data: {
        userId,
        metadata,
      },
    })

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

