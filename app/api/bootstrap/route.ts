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

    // Ensure user exists
    const user = await ensureUserExists(userId)

    // Get or create preferences
    let preferences = user.preferences
    if (!preferences) {
      preferences = await prisma.preference.create({
        data: { userId: user.id },
      })
    }

    return NextResponse.json(
      { 
        success: true, 
        data: {
          user: {
            id: user.id,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
          },
          preferences: {
            id: preferences.id,
            colorProfile: preferences.colorProfile,
            contrastLevel: preferences.contrastLevel,
            labelPreference: preferences.labelPreference,
            createdAt: preferences.createdAt,
            updatedAt: preferences.updatedAt,
          },
        }
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error in bootstrap:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to bootstrap user',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

