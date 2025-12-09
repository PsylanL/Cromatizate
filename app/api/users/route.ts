import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ensureUserExists, getUserIdFromRequest } from '@/lib/api-helpers'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
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
    const user = await ensureUserExists(userId)

    return NextResponse.json(
      { success: true, data: user },
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

