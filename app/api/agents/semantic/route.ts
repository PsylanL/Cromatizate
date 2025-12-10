import { NextRequest, NextResponse } from 'next/server'
import { analyzeColors, analyzeMetadata } from '@/lib/semantic-engine'

/**
 * POST /api/agents/semantic
 * 
 * Agente Semántico
 * 
 * Recibe colores o metadatos básicos del contenido y el tipo de daltonismo del usuario.
 * Aplica transformaciones simples de color y genera descripciones textuales.
 * 
 * Body esperado:
 * {
 *   colors?: string[],           // Array de colores en formato hexadecimal
 *   metadata?: any,              // Metadatos básicos del contenido
 *   visionType?: string          // Tipo de daltonismo (default: 'normal')
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { colors, metadata, visionType } = body
    
    // Validar que al menos haya colores o metadata
    if (!colors && !metadata) {
      return NextResponse.json(
        {
          success: false,
          error: 'Se requiere al menos "colors" o "metadata" en el body'
        },
        { status: 400 }
      )
    }
    
    // Normalizar el tipo de visión (default: 'normal')
    const vision = visionType || 'normal'
    
    let result
    
    // Si hay colores explícitos, usar analyzeColors
    if (colors && Array.isArray(colors)) {
      result = analyzeColors(colors, vision)
    } 
    // Si solo hay metadata, usar analyzeMetadata
    else if (metadata) {
      result = analyzeMetadata(metadata, vision)
    }
    // Caso de error (no debería llegar aquí por la validación anterior)
    else {
      return NextResponse.json(
        {
          success: false,
          error: 'Datos insuficientes para el análisis'
        },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      {
        success: true,
        data: {
          description: result.description,
          adaptedColors: result.adaptedColors,
          rawInput: result.rawInput
        }
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error in semantic agent:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Error procesando la solicitud del agente semántico',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

/**
 * GET /api/agents/semantic
 * 
 * Endpoint de prueba/información del agente semántico
 */
export async function GET(request: NextRequest) {
  return NextResponse.json(
    {
      success: true,
      agent: 'semantic',
      description: 'Agente semántico para análisis de colores y generación de descripciones',
      endpoints: {
        POST: {
          description: 'Analiza colores o metadatos y genera descripciones adaptadas',
          body: {
            colors: 'string[] (opcional) - Array de colores en formato hexadecimal',
            metadata: 'any (opcional) - Metadatos básicos del contenido',
            visionType: 'string (opcional) - Tipo de daltonismo (default: "normal")'
          }
        }
      }
    },
    { status: 200 }
  )
}

