import { NextRequest, NextResponse } from 'next/server'
import { getVisitorId, createSimpleSupabaseClient, ensureVisitorExists } from '@/lib/api-helpers'
import {
  getAdaptationFromPreferences,
  mergePreferences,
  validatePreferences,
  generateRecommendations,
  type UserPreferences
} from '@/lib/personalization'

/**
 * GET /api/agents/profile
 * 
 * Agente de Perfilado - Lee preferencias del usuario
 * 
 * Retorna las preferencias del usuario desde Supabase y las reglas de adaptación recomendadas.
 */
export async function GET(request: NextRequest) {
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
    
    // Crear cliente Supabase
    let supabase
    try {
      supabase = createSimpleSupabaseClient()
    } catch (error) {
      console.error('Supabase client creation failed:', error)
      return NextResponse.json(
        {
          success: false,
          error: 'Server configuration error: Supabase credentials are missing'
        },
        { status: 500 }
      )
    }
    
    // Asegurar que el visitor existe
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
    
    // Parsear preferencias
    let preferences: UserPreferences = {}
    if (visitor.preferences) {
      if (typeof visitor.preferences === 'string') {
        try {
          preferences = JSON.parse(visitor.preferences) as UserPreferences
        } catch {
          preferences = {}
        }
      } else if (typeof visitor.preferences === 'object' && !Array.isArray(visitor.preferences) && visitor.preferences !== null) {
        preferences = visitor.preferences as UserPreferences
      }
    }
    
    // Si hay colorBlindness pero no type en preferences, usar colorBlindness
    if (!preferences.type && visitor.colorBlindness) {
      preferences.type = visitor.colorBlindness
    }
    
    // Validar preferencias
    const validatedPreferences = validatePreferences(preferences)
    
    // Obtener reglas de adaptación
    const adaptationRules = getAdaptationFromPreferences(validatedPreferences)
    
    // Generar recomendaciones
    const recommendations = generateRecommendations(validatedPreferences)
    
    return NextResponse.json(
      {
        success: true,
        data: {
          preferences: validatedPreferences,
          adaptationRules,
          recommendations
        }
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error in profile agent GET:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Error procesando la solicitud del agente de perfilado',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/agents/profile
 * 
 * Agente de Perfilado - Guarda/actualiza preferencias del usuario
 * 
 * Body esperado:
 * {
 *   preferences?: Partial<UserPreferences>  // Preferencias a actualizar (se fusionan con las existentes)
 * }
 */
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
    
    const body = await request.json()
    const { preferences: incomingPreferences } = body
    
    // Validar que haya preferencias en el body
    if (!incomingPreferences || typeof incomingPreferences !== 'object' || Array.isArray(incomingPreferences)) {
      return NextResponse.json(
        {
          success: false,
          error: 'preferences must be a valid object'
        },
        { status: 400 }
      )
    }
    
    // Crear cliente Supabase
    let supabase
    try {
      supabase = createSimpleSupabaseClient()
    } catch (error) {
      console.error('Supabase client creation failed:', error)
      return NextResponse.json(
        {
          success: false,
          error: 'Server configuration error: Supabase credentials are missing'
        },
        { status: 500 }
      )
    }
    
    // Asegurar que el visitor existe
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
    
    // Parsear preferencias existentes
    let existingPreferences: UserPreferences | null = null
    if (visitor.preferences) {
      if (typeof visitor.preferences === 'string') {
        try {
          existingPreferences = JSON.parse(visitor.preferences) as UserPreferences
        } catch {
          existingPreferences = null
        }
      } else if (typeof visitor.preferences === 'object' && !Array.isArray(visitor.preferences) && visitor.preferences !== null) {
        existingPreferences = visitor.preferences as UserPreferences
      }
    }
    
    // Fusionar preferencias
    const mergedPreferences = mergePreferences(existingPreferences, incomingPreferences)
    
    // Validar preferencias fusionadas
    const validatedPreferences = validatePreferences(mergedPreferences)
    
    // Extraer colorBlindness para compatibilidad con la estructura existente
    const colorBlindness = validatedPreferences.type && validatedPreferences.type !== 'normal'
      ? validatedPreferences.type
      : null
    
    // Actualizar en Supabase
    const { error: updateError } = await supabase
      .from('Visitor')
      .update({
        preferences: validatedPreferences,
        colorBlindness,
        updatedAt: new Date().toISOString()
      })
      .eq('id', visitorId)
    
    if (updateError) {
      console.error('Error updating preferences:', updateError)
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to update preferences',
          message: updateError.message
        },
        { status: 500 }
      )
    }
    
    // Obtener reglas de adaptación actualizadas
    const adaptationRules = getAdaptationFromPreferences(validatedPreferences)
    const recommendations = generateRecommendations(validatedPreferences)
    
    return NextResponse.json(
      {
        success: true,
        data: {
          preferences: validatedPreferences,
          adaptationRules,
          recommendations
        }
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error in profile agent POST:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Error procesando la solicitud del agente de perfilado',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

