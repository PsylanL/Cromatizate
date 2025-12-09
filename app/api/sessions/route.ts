import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ensureUserExists, getUserIdFromRequest } from '@/lib/api-helpers'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { metadata } = body

    // Validate required fields
    if (!metadata || typeof metadata !== 'object') {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Metadata is required and must be an object'
        },
        { status: 400 }
      )
    }

    // Get userId from body or headers
    const userId = getUserIdFromRequest(request, body)

    if (!userId) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'userId is required in request body or x-user-id header'
        },
        { status: 400 }
      )
    }

    // Ensure user exists (creates if doesn't exist)
    await ensureUserExists(userId)

    const session = await prisma.session.create({
      data: {
        metadata,
        userId,
      },
    })

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

