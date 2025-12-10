import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ensureVisitorExists } from '@/lib/api-helpers'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    
    const { colorProfile, contrastLevel, labelPreference } = body

    // Validate required fields
    if (!colorProfile && !contrastLevel && !labelPreference) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'At least one preference field is required',
          fields: ['colorProfile', 'contrastLevel', 'labelPreference']
        },
        { status: 400 }
      )
    }

    // Ensure user exists (creates if doesn't exist)
    await ensureVisitorExists(id)

    // Get or create preferences
    let preferences = await prisma.preference.findUnique({
      where: { userId: id },
    })

    if (!preferences) {
      preferences = await prisma.preference.create({
        data: { userId: id },
      })
    }

    // Update preferences
    const updatedPreferences = await prisma.preference.update({
      where: { userId: id },
      data: {
        ...(colorProfile !== undefined && { colorProfile }),
        ...(contrastLevel !== undefined && { contrastLevel }),
        ...(labelPreference !== undefined && { labelPreference }),
      },
    })

    return NextResponse.json(
      { success: true, data: updatedPreferences },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error updating user preferences:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to update user preferences',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
